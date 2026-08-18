import {
  addAttendee,
  attendeeDisplayName,
  checkInAttendee,
  checkedInCount,
  clearCheckIns,
  evaluateScan,
  mergeAttendees,
  parseAttendeeCsv,
  parseQrPayload,
  type Attendee,
} from '@/lib/attendance';

function person(
  id: string,
  firstName: string,
  lastName: string,
  checkedInAt: string | null = null,
): Attendee {
  return { id, firstName, lastName, checkedInAt };
}

describe('parseQrPayload', () => {
  test('reads JSON with firstName and lastName', () => {
    expect(parseQrPayload('{"id":"EMP001","firstName":"Jane","lastName":"Doe"}')).toEqual({
      id: 'EMP001',
      firstName: 'Jane',
      lastName: 'Doe',
    });
  });

  test('reads JSON with first_name and last_name', () => {
    expect(parseQrPayload('{"id":"EMP001","first_name":"Jane","last_name":"Doe"}')).toEqual({
      id: 'EMP001',
      firstName: 'Jane',
      lastName: 'Doe',
    });
  });

  test('reads a plain id string', () => {
    expect(parseQrPayload('  EMP001  ')).toEqual({ id: 'EMP001' });
  });

  test('returns null for empty input', () => {
    expect(parseQrPayload('   ')).toBeNull();
  });

  test('returns null for JSON without an id', () => {
    expect(parseQrPayload('{"firstName":"Jane"}')).toBeNull();
  });
});

describe('parseAttendeeCsv', () => {
  test('parses id, first_name, and last_name columns', () => {
    const csv = ['id,first_name,last_name', 'EMP001,Jane,Doe', 'EMP002,John,Smith'].join('\n');

    expect(parseAttendeeCsv(csv)).toEqual({
      rows: [
        { id: 'EMP001', firstName: 'Jane', lastName: 'Doe' },
        { id: 'EMP002', firstName: 'John', lastName: 'Smith' },
      ],
      errors: [],
    });
  });

  test('accepts First Name style headers and a UTF-8 BOM', () => {
    const csv = '\uFEFFid,First Name,Last Name\nEMP001,Jane,Doe';

    expect(parseAttendeeCsv(csv).rows).toEqual([
      { id: 'EMP001', firstName: 'Jane', lastName: 'Doe' },
    ]);
  });

  test('keeps commas inside quoted names', () => {
    const csv = 'id,first_name,last_name\nEMP001,"Mary, Jane",Doe';

    expect(parseAttendeeCsv(csv).rows[0]).toEqual({
      id: 'EMP001',
      firstName: 'Mary, Jane',
      lastName: 'Doe',
    });
  });

  test('reports missing columns', () => {
    expect(parseAttendeeCsv('id,name\nEMP001,Jane').errors[0]).toMatch(/first_name/);
  });

  test('skips incomplete and duplicate rows', () => {
    const csv = [
      'id,first_name,last_name',
      'EMP001,Jane,Doe',
      'EMP001,Janet,Doe',
      'EMP002,John,',
    ].join('\n');
    const result = parseAttendeeCsv(csv);

    expect(result.rows).toEqual([{ id: 'EMP001', firstName: 'Jane', lastName: 'Doe' }]);
    expect(result.errors).toHaveLength(2);
  });
});

describe('mergeAttendees', () => {
  test('adds new people and updates names without clearing check-in', () => {
    const existing = [person('EMP001', 'Jane', 'Doe', '2026-08-18T00:00:00.000Z')];
    const result = mergeAttendees(existing, [
      { id: 'emp001', firstName: 'Janet', lastName: 'Doe' },
      { id: 'EMP002', firstName: 'John', lastName: 'Smith' },
    ]);

    expect(result).toEqual({
      added: 1,
      updated: 1,
      attendees: [
        person('emp001', 'Janet', 'Doe', '2026-08-18T00:00:00.000Z'),
        person('EMP002', 'John', 'Smith'),
      ],
    });
  });
});

describe('addAttendee', () => {
  test('appends a trimmed person', () => {
    const result = addAttendee([], { id: ' EMP001 ', firstName: ' Jane ', lastName: ' Doe ' });

    expect(result).toEqual({
      attendees: [person('EMP001', 'Jane', 'Doe')],
    });
  });

  test('rejects a duplicate id ignoring case', () => {
    expect(addAttendee([person('EMP001', 'Jane', 'Doe')], { id: 'emp001', firstName: 'A', lastName: 'B' })).toEqual({
      error: 'An attendee with id emp001 already exists.',
    });
  });

  test('requires id, first name, and last name', () => {
    expect(addAttendee([], { id: '', firstName: 'Jane', lastName: 'Doe' })).toEqual({
      error: 'ID, first name, and last name are required.',
    });
  });
});

describe('evaluateScan and check-in', () => {
  const attendees = [
    person('EMP001', 'Jane', 'Doe'),
    person('EMP002', 'John', 'Smith', '2026-08-18T01:00:00.000Z'),
  ];

  test('matches a person who is on the list', () => {
    expect(evaluateScan(attendees, '{"id":"emp001"}')).toEqual({
      status: 'match',
      attendee: attendees[0],
    });
  });

  test('rejects a QR that is not on the list', () => {
    expect(evaluateScan(attendees, 'EMP999')).toEqual({ status: 'not_on_list', id: 'EMP999' });
  });

  test('does not count a person twice', () => {
    expect(evaluateScan(attendees, 'EMP002')).toEqual({
      status: 'already_checked_in',
      attendee: attendees[1],
    });
  });

  test('increments unique check-ins on confirm', () => {
    const at = new Date('2026-08-18T02:00:00.000Z');
    const next = checkInAttendee(attendees, 'EMP001', at);

    expect(checkedInCount(attendees)).toBe(1);
    expect(checkedInCount(next)).toBe(2);
    expect(next[0].checkedInAt).toBe(at.toISOString());
  });

  test('does not overwrite an existing check-in time', () => {
    const next = checkInAttendee(attendees, 'EMP002', new Date('2026-08-18T09:00:00.000Z'));
    expect(next[1].checkedInAt).toBe('2026-08-18T01:00:00.000Z');
  });

  test('clearCheckIns resets attendance but keeps the list', () => {
    const next = clearCheckIns(attendees);
    expect(next).toHaveLength(2);
    expect(checkedInCount(next)).toBe(0);
  });
});

describe('attendeeDisplayName', () => {
  test('joins first and last name', () => {
    expect(attendeeDisplayName({ firstName: 'Jane', lastName: 'Doe' })).toBe('Jane Doe');
  });
});
