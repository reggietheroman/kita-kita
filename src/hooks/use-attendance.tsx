import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  addAttendee,
  checkInAttendee,
  checkedInCount,
  clearCheckIns,
  evaluateScan,
  mergeAttendees,
  parseAttendeeCsv,
  type Attendee,
  type AttendeeInput,
  type ScanOutcome,
} from '@/lib/attendance';

const STORAGE_KEY = 'kita-kita.attendees.v1';

type AttendanceContextValue = {
  attendees: Attendee[];
  loaded: boolean;
  checkedInCount: number;
  importCsv: (text: string) => { added: number; updated: number; errors: string[] };
  addPerson: (input: AttendeeInput) => string | null;
  evaluateQr: (rawQr: string) => ScanOutcome;
  confirmCheckIn: (id: string) => void;
  resetCheckIns: () => void;
};

const AttendanceContext = createContext<AttendanceContextValue | null>(null);

async function loadAttendees(): Promise<Attendee[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isAttendee);
  } catch {
    return [];
  }
}

function isAttendee(value: unknown): value is Attendee {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.firstName === 'string' &&
    typeof record.lastName === 'string' &&
    (record.checkedInAt === null || typeof record.checkedInAt === 'string')
  );
}

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loaded, setLoaded] = useState(false);
  const attendeesRef = useRef(attendees);
  attendeesRef.current = attendees;

  useEffect(() => {
    let cancelled = false;
    loadAttendees()
      .then((stored) => {
        if (!cancelled) {
          attendeesRef.current = stored;
          setAttendees(stored);
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
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(attendees)).catch(() => {
      // Local persistence should not crash the UI if storage fails.
    });
  }, [attendees, loaded]);

  const persist = useCallback((next: Attendee[]) => {
    attendeesRef.current = next;
    setAttendees(next);
  }, []);

  const importCsv = useCallback(
    (text: string) => {
      const parsed = parseAttendeeCsv(text);
      const merged = mergeAttendees(attendeesRef.current, parsed.rows);
      persist(merged.attendees);
      return { added: merged.added, updated: merged.updated, errors: parsed.errors };
    },
    [persist],
  );

  const addPerson = useCallback(
    (input: AttendeeInput) => {
      const result = addAttendee(attendeesRef.current, input);
      if ('error' in result) {
        return result.error;
      }
      persist(result.attendees);
      return null;
    },
    [persist],
  );

  const evaluateQr = useCallback(
    (rawQr: string) => evaluateScan(attendeesRef.current, rawQr),
    [],
  );

  const confirmCheckIn = useCallback(
    (id: string) => {
      persist(checkInAttendee(attendeesRef.current, id));
    },
    [persist],
  );

  const resetCheckIns = useCallback(() => {
    persist(clearCheckIns(attendeesRef.current));
  }, [persist]);

  const value = useMemo<AttendanceContextValue>(
    () => ({
      attendees,
      loaded,
      checkedInCount: checkedInCount(attendees),
      importCsv,
      addPerson,
      evaluateQr,
      confirmCheckIn,
      resetCheckIns,
    }),
    [addPerson, attendees, confirmCheckIn, evaluateQr, importCsv, loaded, resetCheckIns],
  );

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
}

export function useAttendance(): AttendanceContextValue {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within AttendanceProvider');
  }
  return context;
}
