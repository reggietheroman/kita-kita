import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { randomUUID } from 'expo-crypto';
import { Platform } from 'react-native';

import type { Attendee, Meeting } from '@/lib/attendance';
import { generateMeetingKey, openForMeeting, sealForMeeting } from '@/lib/crypto';
import type { MeetingRecord, MeetingsState } from '@/lib/meetings';

const LEGACY_STORAGE_KEY = 'kita-kita.attendees.v1';
const STORAGE_KEY = 'kita-kita.meetings.v1';
const APP_KEY_ID = 'kita-kita.app-key-id.v1';
const APP_KEYS_PREFIX = 'kita-kita.app-key.';

type PersistedState = MeetingsState & {
  meetingKeys: Record<string, string>;
};

async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(`__secure_${key}`);
    }
    return AsyncStorage.getItem(`__secure_${key}`);
  }
  return SecureStore.getItemAsync(key);
}

async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`__secure_${key}`, value);
      return;
    }
    await AsyncStorage.setItem(`__secure_${key}`, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function loadState(): Promise<PersistedState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return migrateLegacyState();
  }
  try {
    const parsed = JSON.parse(raw) as { keyId?: string; data?: string };
    if (!parsed?.keyId || !parsed.data) {
      return migrateLegacyState();
    }
    const key = await getSecureItem(`${APP_KEYS_PREFIX}${parsed.keyId}`);
    if (!key) {
      return migrateLegacyState();
    }
    const plaintext = await openForMeeting(parsed.keyId, key, parsed.data);
    const state = JSON.parse(plaintext) as PersistedState;
    if (!Array.isArray(state.records)) {
      return migrateLegacyState();
    }
    return {
      ...state,
      records: state.records.map((record) => ({
        ...record,
        meeting: {
          ...record.meeting,
          endsAt:
            record.meeting.endsAt ??
            new Date(new Date(record.meeting.startsAt).getTime() + 60 * 60 * 1000).toISOString(),
        },
      })),
    };
  } catch {
    return migrateLegacyState();
  }
}

export async function saveState(state: PersistedState): Promise<void> {
  const keyId = await ensureAppKey();
  const key = await getSecureItem(`${APP_KEYS_PREFIX}${keyId}`);
  if (!key) {
    return;
  }
  const plaintext = JSON.stringify(state);
  const data = await sealForMeeting(keyId, key, plaintext);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ keyId, data }));
}

async function ensureAppKey(): Promise<string> {
  const existing = await getSecureItem(APP_KEY_ID);
  if (existing) {
    return existing;
  }
  const keyId = randomUUID();
  const appKey = await generateMeetingKey();
  await setSecureItem(APP_KEY_ID, keyId);
  await setSecureItem(`${APP_KEYS_PREFIX}${keyId}`, appKey);
  return keyId;
}

async function migrateLegacyState(): Promise<PersistedState> {
  const raw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) {
    return { selectedMeetingId: null, records: [], meetingKeys: {} };
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { selectedMeetingId: null, records: [], meetingKeys: {} };
    }
    const attendees = parsed.filter(isAttendee);
    if (!attendees.length) {
      return { selectedMeetingId: null, records: [], meetingKeys: {} };
    }
    const meetingId = randomUUID();
    const meeting: Meeting = {
      id: meetingId,
      name: 'Imported meeting',
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      location: 'Not set',
    };
    const record: MeetingRecord = { meeting, attendees };
    const key = await generateMeetingKey();
    return {
      selectedMeetingId: meetingId,
      records: [record],
      meetingKeys: { [meetingId]: key },
    };
  } catch {
    return { selectedMeetingId: null, records: [], meetingKeys: {} };
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
    (record.checkedInAt === null || typeof record.checkedInAt === 'string') &&
    (record.email === undefined || typeof record.email === 'string') &&
    (record.phoneNumber === undefined || typeof record.phoneNumber === 'string')
  );
}
