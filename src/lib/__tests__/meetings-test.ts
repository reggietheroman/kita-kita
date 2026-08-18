import { parseMeetingDateTime, upsertMeetingRecord } from '@/lib/meetings';

const existing = {
  selectedMeetingId: 'meeting-1',
  records: [
    {
      meeting: { id: 'meeting-1', name: 'A', startsAt: '2026-01-01T00:00:00.000Z', endsAt: '2026-01-01T01:00:00.000Z', location: 'HQ' },
      attendees: [
        { id: 'EMP001', firstName: 'Jane', lastName: 'Doe', checkedInAt: '2026-01-01T10:00:00.000Z' },
      ],
    },
  ],
};

describe('meetings merge', () => {
  test('upserts and keeps earliest check-in', () => {
    const result = upsertMeetingRecord(existing, {
      meeting: { id: 'meeting-1', name: 'A', startsAt: '2026-01-01T00:00:00.000Z', endsAt: '2026-01-01T01:00:00.000Z', location: 'HQ' },
      attendees: [
        { id: 'EMP001', firstName: 'Jane', lastName: 'Doe', checkedInAt: '2026-01-01T11:00:00.000Z' },
        { id: 'EMP002', firstName: 'John', lastName: 'Smith', checkedInAt: null },
      ],
    });
    expect(result.records[0].attendees).toEqual([
      { id: 'EMP001', firstName: 'Jane', lastName: 'Doe', checkedInAt: '2026-01-01T10:00:00.000Z' },
      { id: 'EMP002', firstName: 'John', lastName: 'Smith', checkedInAt: null },
    ]);
  });
});

describe('meeting date and time parsing', () => {
  test('accepts a valid date and time', () => {
    expect(parseMeetingDateTime('2026-08-18', '09:30')).not.toBeNull();
  });

  test('rejects invalid input', () => {
    expect(parseMeetingDateTime('2026-02-30', '09:30')).toBeNull();
    expect(parseMeetingDateTime('2026-08-18', '9:30')).toBeNull();
  });
});
