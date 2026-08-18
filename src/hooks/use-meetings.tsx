import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { parseAttendeeCsv, type AttendeeInput, type Meeting } from '@/lib/attendance';
import { generateMeetingKey, openForMeeting, sealForMeeting } from '@/lib/crypto';
import {
  addAttendeeToMeeting,
  checkedInCountForMeeting,
  clearMeetingCheckIns,
  confirmMeetingCheckIn,
  createMeeting,
  deleteMeeting,
  evaluateAttendeeId,
  importIntoMeeting,
  removeMeetingAttendee,
  type AttendeeScanOutcome,
  type MeetingRecord,
  type MeetingsState,
  updateMeetingAttendee,
} from '@/lib/meetings';
import { encodeEnvelope, parseEnvelope, type TransferFrame } from '@/lib/qr-envelope';
import {
  buildTransferFrames,
  reconstructTransferPayload,
  serializeTransferPayload,
} from '@/lib/qr-transfer';
import { loadState, saveState } from '@/lib/storage';

type MeetingsContextValue = {
  loaded: boolean;
  records: MeetingRecord[];
  selectedMeetingId: string | null;
  selectedRecord?: MeetingRecord;
  meetingKeys: Record<string, string>;
  selectMeeting: (meetingId: string) => void;
  createMeetingRecord: (input: {
    name: string;
    startsAt: string;
    endsAt: string;
    location: string;
  }) => Promise<string>;
  updateMeetingRecord: (meeting: Meeting) => void;
  deleteMeetingRecord: (meetingId: string) => void;
  importCsv: (meetingId: string, text: string) => { added: number; updated: number; errors: string[] };
  addPerson: (meetingId: string, input: AttendeeInput) => string | null;
  updatePerson: (meetingId: string, attendeeId: string, input: AttendeeInput) => string | null;
  removePerson: (meetingId: string, attendeeId: string) => void;
  confirmCheckIn: (meetingId: string, attendeeId: string) => void;
  resetCheckIns: (meetingId: string) => void;
  checkedInCount: (meetingId: string) => number;
  createAttendeeQr: (meetingId: string, attendeeId: string) => Promise<string | null>;
  evaluateAttendeeQr: (rawQr: string) => Promise<AttendeeScanOutcome>;
  buildCloneTransferQrs: (meetingId: string) => Promise<string[]>;
  buildSyncTransferQrs: (meetingId: string) => Promise<string[]>;
  applyTransferFrames: (frames: TransferFrame[]) => Promise<{ ok: boolean; message: string }>;
};

const MeetingsContext = createContext<MeetingsContextValue | null>(null);

type InternalState = MeetingsState & {
  meetingKeys: Record<string, string>;
};

const emptyState: InternalState = { selectedMeetingId: null, records: [], meetingKeys: {} };

export function MeetingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InternalState>(emptyState);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    let cancelled = false;
    loadState()
      .then((next) => {
        if (!cancelled) {
          setState(next);
          ref.current = next;
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    saveState(state).catch(() => {
      // Best effort persistence, never crash UI.
    });
  }, [loaded, state]);

  const patchState = useCallback((updater: (current: InternalState) => InternalState) => {
    const next = updater(ref.current);
    ref.current = next;
    setState(next);
  }, []);

  const selectMeeting = useCallback(
    (meetingId: string) => {
      patchState((current) => ({ ...current, selectedMeetingId: meetingId }));
    },
    [patchState],
  );

  const createMeetingRecord = useCallback(
    async (input: { name: string; startsAt: string; endsAt: string; location: string }) => {
      const record = createMeeting(input);
      const id = record.meeting.id;
      const key = await generateMeetingKey();
      patchState((current) => ({
        selectedMeetingId: current.selectedMeetingId ?? id,
        records: [...current.records, record],
        meetingKeys: {
          ...current.meetingKeys,
          [id]: key,
        },
      }));
      return id;
    },
    [patchState],
  );

  const updateMeetingRecord = useCallback(
    (meeting: Meeting) => {
      patchState((current) => ({
        ...current,
        records: current.records.map((record) =>
          record.meeting.id === meeting.id ? { ...record, meeting } : record,
        ),
      }));
    },
    [patchState],
  );

  const deleteMeetingRecord = useCallback(
    (meetingId: string) => {
      patchState((current) => {
        const next = deleteMeeting(current, meetingId);
        const meetingKeys = { ...current.meetingKeys };
        delete meetingKeys[meetingId];
        return { ...next, meetingKeys };
      });
    },
    [patchState],
  );

  const importCsv = useCallback(
    (meetingId: string, text: string) => {
      const parsed = parseAttendeeCsv(text);
      patchState((current) => {
        const records = current.records.map((record) => {
          if (record.meeting.id !== meetingId) {
            return record;
          }
          const merged = importIntoMeeting(record, parsed.rows);
          return { ...record, attendees: merged.attendees };
        });
        return { ...current, records };
      });
      const current = ref.current.records.find((record) => record.meeting.id === meetingId);
      const merged = current ? importIntoMeeting(current, parsed.rows) : { added: 0, updated: 0 };
      return { added: merged.added, updated: merged.updated, errors: parsed.errors };
    },
    [patchState],
  );

  const addPerson = useCallback(
    (meetingId: string, input: AttendeeInput) => {
      let error: string | null = null;
      patchState((current) => {
        const records = current.records.map((record) => {
          if (record.meeting.id !== meetingId) {
            return record;
          }
          const result = addAttendeeToMeeting(record, input);
          if ('error' in result) {
            error = result.error;
            return record;
          }
          return { ...record, attendees: result.attendees };
        });
        return { ...current, records };
      });
      return error;
    },
    [patchState],
  );

  const updatePerson = useCallback(
    (meetingId: string, attendeeId: string, input: AttendeeInput) => {
      let error: string | null = null;
      patchState((current) => ({
        ...current,
        records: current.records.map((record) => {
          if (record.meeting.id !== meetingId) {
            return record;
          }
          const result = updateMeetingAttendee(record, attendeeId, input);
          if ('error' in result) {
            error = result.error;
            return record;
          }
          return { ...record, attendees: result.attendees };
        }),
      }));
      return error;
    },
    [patchState],
  );

  const removePerson = useCallback(
    (meetingId: string, attendeeId: string) => {
      patchState((current) => ({
        ...current,
        records: current.records.map((record) =>
          record.meeting.id === meetingId ? removeMeetingAttendee(record, attendeeId) : record,
        ),
      }));
    },
    [patchState],
  );

  const confirmCheckIn = useCallback(
    (meetingId: string, attendeeId: string) => {
      patchState((current) => ({
        ...current,
        records: current.records.map((record) =>
          record.meeting.id === meetingId ? confirmMeetingCheckIn(record, attendeeId) : record,
        ),
      }));
    },
    [patchState],
  );

  const resetCheckIns = useCallback(
    (meetingId: string) => {
      patchState((current) => ({
        ...current,
        records: current.records.map((record) =>
          record.meeting.id === meetingId ? clearMeetingCheckIns(record) : record,
        ),
      }));
    },
    [patchState],
  );

  const checkedInCount = useCallback((meetingId: string) => {
    const record = ref.current.records.find((row) => row.meeting.id === meetingId);
    return checkedInCountForMeeting(record);
  }, []);

  const createAttendeeQr = useCallback(async (meetingId: string, attendeeId: string) => {
    const key = ref.current.meetingKeys[meetingId];
    if (!key) {
      return null;
    }
    const ciphertext = await sealForMeeting(meetingId, key, attendeeId);
    return encodeEnvelope({ v: 1, t: 'a', m: meetingId, c: ciphertext });
  }, []);

  const evaluateAttendeeQr = useCallback(async (rawQr: string): Promise<AttendeeScanOutcome> => {
    const parsed = parseEnvelope(rawQr);
    if (!parsed || parsed.t !== 'a') {
      return { status: 'invalid' };
    }
    const key = ref.current.meetingKeys[parsed.m];
    if (!key) {
      return { status: 'unknown_meeting' };
    }
    try {
      const attendeeId = await openForMeeting(parsed.m, key, parsed.c);
      const record = ref.current.records.find((item) => item.meeting.id === parsed.m);
      return evaluateAttendeeId(record, attendeeId);
    } catch {
      return { status: 'invalid' };
    }
  }, []);

  const buildCloneTransferQrs = useCallback(async (meetingId: string) => {
    const key = ref.current.meetingKeys[meetingId];
    const record = ref.current.records.find((item) => item.meeting.id === meetingId);
    if (!key || !record) {
      return [];
    }
    const payloadJson = JSON.stringify({ kind: 'clone', record, key });
    const compressed = await serializeTransferPayload(meetingId, payloadJson);
    return buildTransferFrames('clone', meetingId, compressed).map((frame) => encodeEnvelope(frame));
  }, []);

  const buildSyncTransferQrs = useCallback(async (meetingId: string) => {
    const key = ref.current.meetingKeys[meetingId];
    const record = ref.current.records.find((item) => item.meeting.id === meetingId);
    if (!key || !record) {
      return [];
    }
    const checkedIn = record.attendees
      .filter((attendee) => attendee.checkedInAt)
      .map((attendee) => ({ id: attendee.id, checkedInAt: attendee.checkedInAt! }));
    const sealed = await sealForMeeting(meetingId, key, JSON.stringify({ checkedIn }));
    const compressed = await serializeTransferPayload(
      meetingId,
      JSON.stringify({ kind: 'sync', meetingId, sealed }),
    );
    return buildTransferFrames('sync', meetingId, compressed).map((frame) => encodeEnvelope(frame));
  }, []);

  const applyTransferFrames = useCallback(
    async (frames: TransferFrame[]) => {
      const rebuilt = await reconstructTransferPayload(frames);
      if (!rebuilt) {
        return { ok: false, message: 'Could not decode transfer QR set.' };
      }
      const payload = JSON.parse(rebuilt.payloadJson) as Record<string, unknown>;
      if (payload.kind === 'clone') {
        const record = payload.record as MeetingRecord | undefined;
        const key = typeof payload.key === 'string' ? payload.key : undefined;
        if (!record || !key) {
          return { ok: false, message: 'Clone payload is invalid.' };
        }
        patchState((current) => {
          const existingIndex = current.records.findIndex((item) => item.meeting.id === record.meeting.id);
          const records = [...current.records];
          if (existingIndex === -1) {
            records.push(record);
          } else {
            records[existingIndex] = record;
          }
          return {
            ...current,
            selectedMeetingId: current.selectedMeetingId ?? record.meeting.id,
            records,
            meetingKeys: { ...current.meetingKeys, [record.meeting.id]: key },
          };
        });
        return { ok: true, message: 'Meeting copied successfully.' };
      }
      if (payload.kind === 'sync') {
        const meetingId = typeof payload.meetingId === 'string' ? payload.meetingId : '';
        const sealed = typeof payload.sealed === 'string' ? payload.sealed : '';
        const key = ref.current.meetingKeys[meetingId];
        if (!meetingId || !sealed || !key) {
          return { ok: false, message: 'Sync payload cannot be applied on this device.' };
        }
        const opened = await openForMeeting(meetingId, key, sealed);
        const sync = JSON.parse(opened) as { checkedIn: Array<{ id: string; checkedInAt: string }> };
        patchState((current) => ({
          ...current,
          records: current.records.map((record) => {
            if (record.meeting.id !== meetingId) {
              return record;
            }
            const attendees = record.attendees.map((attendee) => {
              const incoming = sync.checkedIn.find(
                (row) => row.id.toLowerCase() === attendee.id.toLowerCase(),
              );
              if (!incoming) {
                return attendee;
              }
              if (!attendee.checkedInAt) {
                return { ...attendee, checkedInAt: incoming.checkedInAt };
              }
              return {
                ...attendee,
                checkedInAt:
                  attendee.checkedInAt < incoming.checkedInAt ? attendee.checkedInAt : incoming.checkedInAt,
              };
            });
            return { ...record, attendees };
          }),
        }));
        return { ok: true, message: 'Attendance synced.' };
      }
      return { ok: false, message: 'Unsupported transfer payload.' };
    },
    [patchState],
  );

  const selectedRecord = useMemo(
    () => state.records.find((record) => record.meeting.id === state.selectedMeetingId),
    [state.records, state.selectedMeetingId],
  );

  const value = useMemo<MeetingsContextValue>(
    () => ({
      loaded,
      records: state.records,
      selectedMeetingId: state.selectedMeetingId,
      selectedRecord,
      meetingKeys: state.meetingKeys,
      selectMeeting,
      createMeetingRecord,
      updateMeetingRecord,
      deleteMeetingRecord,
      importCsv,
      addPerson,
      updatePerson,
      removePerson,
      confirmCheckIn,
      resetCheckIns,
      checkedInCount,
      createAttendeeQr,
      evaluateAttendeeQr,
      buildCloneTransferQrs,
      buildSyncTransferQrs,
      applyTransferFrames,
    }),
    [
      addPerson,
      removePerson,
      applyTransferFrames,
      buildCloneTransferQrs,
      buildSyncTransferQrs,
      checkedInCount,
      confirmCheckIn,
      createAttendeeQr,
      createMeetingRecord,
      deleteMeetingRecord,
      evaluateAttendeeQr,
      importCsv,
      loaded,
      resetCheckIns,
      selectMeeting,
      selectedRecord,
      state.meetingKeys,
      state.records,
      state.selectedMeetingId,
      updatePerson,
      updateMeetingRecord,
    ],
  );

  return <MeetingsContext.Provider value={value}>{children}</MeetingsContext.Provider>;
}

export function useMeetings(): MeetingsContextValue {
  const context = useContext(MeetingsContext);
  if (!context) {
    throw new Error('useMeetings must be used within MeetingsProvider');
  }
  return context;
}
