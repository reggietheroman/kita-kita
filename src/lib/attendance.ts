export type Attendee = {
  id: string;
  firstName: string;
  lastName: string;
  checkedInAt: string | null;
};

export type AttendeeInput = {
  id: string;
  firstName: string;
  lastName: string;
};

export type QrPayload = {
  id: string;
  firstName?: string;
  lastName?: string;
};

export type CsvParseResult = {
  rows: AttendeeInput[];
  errors: string[];
};

export type ScanOutcome =
  | { status: 'invalid' }
  | { status: 'not_on_list'; id: string }
  | { status: 'already_checked_in'; attendee: Attendee }
  | { status: 'match'; attendee: Attendee };

export function attendeeDisplayName(attendee: Pick<Attendee, 'firstName' | 'lastName'>): string {
  return `${attendee.firstName} ${attendee.lastName}`.trim();
}

export function checkedInCount(attendees: Attendee[]): number {
  return attendees.filter((attendee) => attendee.checkedInAt).length;
}

export function parseQrPayload(data: string): QrPayload | null {
  const trimmed = data.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const record = parsed as Record<string, unknown>;
      const id = readOptionalString(record, ['id']);
      if (!id) {
        return null;
      }
      return {
        id,
        firstName: readOptionalString(record, ['firstName', 'first_name', 'firstname']),
        lastName: readOptionalString(record, ['lastName', 'last_name', 'lastname']),
      };
    }
  } catch {
    // Not JSON — treat the whole string as an attendee id.
  }

  if (trimmed.includes('\n')) {
    return null;
  }

  return { id: trimmed };
}

export function parseAttendeeCsv(text: string): CsvParseResult {
  const errors: string[] = [];
  const rows: AttendeeInput[] = [];
  const cleaned = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleaned.split('\n').filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { rows, errors: ['The CSV file is empty.'] };
  }

  const headerCells = parseCsvLine(lines[0]).map(normalizeHeader);
  const idIndex = headerCells.findIndex((header) => header === 'id');
  const firstIndex = headerCells.findIndex((header) =>
    ['first_name', 'firstname', 'first'].includes(header),
  );
  const lastIndex = headerCells.findIndex((header) =>
    ['last_name', 'lastname', 'last'].includes(header),
  );

  if (idIndex === -1 || firstIndex === -1 || lastIndex === -1) {
    return {
      rows,
      errors: ['CSV must include id, first_name, and last_name columns.'],
    };
  }

  const seen = new Set<string>();
  for (let i = 1; i < lines.length; i += 1) {
    const lineNumber = i + 1;
    const cells = parseCsvLine(lines[i]);
    const id = (cells[idIndex] ?? '').trim();
    const firstName = (cells[firstIndex] ?? '').trim();
    const lastName = (cells[lastIndex] ?? '').trim();

    if (!id && !firstName && !lastName) {
      continue;
    }

    if (!id || !firstName || !lastName) {
      errors.push(`Row ${lineNumber} is missing id, first name, or last name.`);
      continue;
    }

    const key = id.toLowerCase();
    if (seen.has(key)) {
      errors.push(`Row ${lineNumber} has a duplicate id: ${id}.`);
      continue;
    }

    seen.add(key);
    rows.push({ id, firstName, lastName });
  }

  return { rows, errors };
}

export function mergeAttendees(
  existing: Attendee[],
  incoming: AttendeeInput[],
): { attendees: Attendee[]; added: number; updated: number } {
  const byId = new Map(existing.map((attendee) => [attendee.id.toLowerCase(), attendee]));
  let added = 0;
  let updated = 0;

  for (const row of incoming) {
    const key = row.id.toLowerCase();
    const current = byId.get(key);
    if (current) {
      byId.set(key, {
        ...current,
        id: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
      });
      updated += 1;
    } else {
      byId.set(key, { ...row, checkedInAt: null });
      added += 1;
    }
  }

  return { attendees: Array.from(byId.values()), added, updated };
}

export function addAttendee(
  attendees: Attendee[],
  input: AttendeeInput,
): { attendees: Attendee[] } | { error: string } {
  const id = input.id.trim();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (!id || !firstName || !lastName) {
    return { error: 'ID, first name, and last name are required.' };
  }

  if (attendees.some((attendee) => attendee.id.toLowerCase() === id.toLowerCase())) {
    return { error: `An attendee with id ${id} already exists.` };
  }

  return {
    attendees: [...attendees, { id, firstName, lastName, checkedInAt: null }],
  };
}

export function evaluateScan(attendees: Attendee[], rawQr: string): ScanOutcome {
  const payload = parseQrPayload(rawQr);
  if (!payload) {
    return { status: 'invalid' };
  }

  const attendee = attendees.find(
    (person) => person.id.toLowerCase() === payload.id.toLowerCase(),
  );
  if (!attendee) {
    return { status: 'not_on_list', id: payload.id };
  }
  if (attendee.checkedInAt) {
    return { status: 'already_checked_in', attendee };
  }
  return { status: 'match', attendee };
}

export function checkInAttendee(
  attendees: Attendee[],
  id: string,
  at = new Date(),
): Attendee[] {
  return attendees.map((attendee) =>
    attendee.id.toLowerCase() === id.toLowerCase() && !attendee.checkedInAt
      ? { ...attendee, checkedInAt: at.toISOString() }
      : attendee,
  );
}

export function clearCheckIns(attendees: Attendee[]): Attendee[] {
  return attendees.map((attendee) => ({ ...attendee, checkedInAt: null }));
}

function readOptionalString(
  record: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '_');
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const character = line[i];
    if (inQuotes) {
      if (character === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += character;
      }
    } else if (character === '"') {
      inQuotes = true;
    } else if (character === ',') {
      result.push(current);
      current = '';
    } else {
      current += character;
    }
  }

  result.push(current);
  return result.map((value) => value.trim());
}
