import { randomUUID } from 'expo-crypto';

import {
  addAttendee,
  checkInAttendee,
  checkedInCount,
  clearCheckIns,
  mergeAttendees,
  type Attendee,
  type AttendeeInput,
  type Meeting,
} from '@/lib/attendance';

export type MeetingRecord = {
  meeting: Meeting;
  attendees: Attendee[];
};

export type MeetingsState = {
  selectedMeetingId: string | null;
  records: MeetingRecord[];
};

export type AttendeeScanOutcome =
  | { status: 'invalid' }
  | { status: 'unknown_meeting' }
  | { status: 'not_on_list'; id: string }
  | { status: 'already_checked_in'; attendee: Attendee }
  | { status: 'match'; attendee: Attendee };

export function createMeeting(input: {
  name: string;
  startsAt: string;
  endsAt: string;
  location: string;
}): MeetingRecord {
  return {
    meeting: {
      id: randomUUID(),
      name: input.name.trim(),
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      location: input.location.trim(),
    },
    attendees: [],
  };
}

export function parseMeetingDateTime(date: string, time: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hours > 23 || minutes > 59) {
    return null;
  }
  const result = new Date(year, month - 1, day, hours, minutes);
  if (
    result.getFullYear() !== year ||
    result.getMonth() !== month - 1 ||
    result.getDate() !== day ||
    result.getHours() !== hours ||
    result.getMinutes() !== minutes
  ) {
    return null;
  }
  return result;
}

export function formatMeetingDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function formatMeetingTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function updateMeeting(state: MeetingsState, meeting: Meeting): MeetingsState {
  return {
    ...state,
    records: state.records.map((record) =>
      record.meeting.id === meeting.id ? { ...record, meeting } : record,
    ),
  };
}

export function deleteMeeting(state: MeetingsState, meetingId: string): MeetingsState {
  const records = state.records.filter((record) => record.meeting.id !== meetingId);
  return {
    selectedMeetingId:
      state.selectedMeetingId === meetingId ? records[0]?.meeting.id ?? null : state.selectedMeetingId,
    records,
  };
}

export function upsertMeetingRecord(state: MeetingsState, incoming: MeetingRecord): MeetingsState {
  const index = state.records.findIndex((record) => record.meeting.id === incoming.meeting.id);
  if (index === -1) {
    return {
      selectedMeetingId: state.selectedMeetingId ?? incoming.meeting.id,
      records: [...state.records, incoming],
    };
  }
  const current = state.records[index];
  const merged = mergeAttendees(current.attendees, incoming.attendees);
  const withCheckIns = merged.attendees.map((attendee) => {
    const incomingMatch = incoming.attendees.find(
      (row) => row.id.toLowerCase() === attendee.id.toLowerCase(),
    );
    if (!attendee.checkedInAt || !incomingMatch?.checkedInAt) {
      return { ...attendee, checkedInAt: attendee.checkedInAt ?? incomingMatch?.checkedInAt ?? null };
    }
    return {
      ...attendee,
      checkedInAt:
        attendee.checkedInAt < incomingMatch.checkedInAt ? attendee.checkedInAt : incomingMatch.checkedInAt,
    };
  });
  const next = [...state.records];
  next[index] = { meeting: incoming.meeting, attendees: withCheckIns };
  return { ...state, records: next };
}

export function checkedInCountForMeeting(record?: MeetingRecord): number {
  return record ? checkedInCount(record.attendees) : 0;
}

export function addAttendeeToMeeting(record: MeetingRecord, input: AttendeeInput) {
  return addAttendee(record.attendees, input);
}

export function importIntoMeeting(record: MeetingRecord, incoming: AttendeeInput[]) {
  return mergeAttendees(record.attendees, incoming);
}

export function updateMeetingAttendee(
  record: MeetingRecord,
  attendeeId: string,
  input: AttendeeInput,
): { attendees: Attendee[] } | { error: string } {
  const duplicate = record.attendees.some(
    (attendee) => attendee.id.toLowerCase() === input.id.trim().toLowerCase() && attendee.id.toLowerCase() !== attendeeId.toLowerCase(),
  );
  if (duplicate) {
    return { error: `An attendee with id ${input.id.trim()} already exists.` };
  }
  const base = record.attendees.find((attendee) => attendee.id.toLowerCase() === attendeeId.toLowerCase());
  if (!base) {
    return { error: 'Attendee not found.' };
  }
  const added = addAttendee([], input);
  if ('error' in added) {
    return { error: added.error };
  }
  const normalized = added.attendees[0];
  return {
    attendees: record.attendees.map((attendee) =>
      attendee.id.toLowerCase() === attendeeId.toLowerCase()
        ? { ...normalized, checkedInAt: attendee.checkedInAt }
        : attendee,
    ),
  };
}

export function removeMeetingAttendee(record: MeetingRecord, attendeeId: string): MeetingRecord {
  return {
    ...record,
    attendees: record.attendees.filter((attendee) => attendee.id.toLowerCase() !== attendeeId.toLowerCase()),
  };
}

export function clearMeetingCheckIns(record: MeetingRecord): MeetingRecord {
  return { ...record, attendees: clearCheckIns(record.attendees) };
}

export function confirmMeetingCheckIn(record: MeetingRecord, attendeeId: string): MeetingRecord {
  return { ...record, attendees: checkInAttendee(record.attendees, attendeeId) };
}

export function evaluateAttendeeId(record: MeetingRecord | undefined, attendeeId: string): AttendeeScanOutcome {
  if (!record) {
    return { status: 'unknown_meeting' };
  }
  const attendee = record.attendees.find((person) => person.id.toLowerCase() === attendeeId.toLowerCase());
  if (!attendee) {
    return { status: 'not_on_list', id: attendeeId };
  }
  if (attendee.checkedInAt) {
    return { status: 'already_checked_in', attendee };
  }
  return { status: 'match', attendee };
}
