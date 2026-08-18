export type Meeting = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  location: string;
};

export type Attendee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  checkedInAt: string | null;
};

export type AttendeeInput = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
};

export type CsvParseResult = {
  rows: AttendeeInput[];
  errors: string[];
};

export function attendeeDisplayName(attendee: Pick<Attendee, 'firstName' | 'lastName'>): string {
  return `${attendee.firstName} ${attendee.lastName}`.trim();
}

export function checkedInCount(attendees: Attendee[]): number {
  return attendees.filter((attendee) => attendee.checkedInAt).length;
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

  const emailIndex = headerCells.findIndex((header) => ['email', 'email_address'].includes(header));
  const phoneIndex = headerCells.findIndex((header) =>
    ['phone', 'phone_number', 'phonenumber', 'mobile', 'contact_number'].includes(header),
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
    const emailRaw = (cells[emailIndex] ?? '').trim();
    const phoneRaw = (cells[phoneIndex] ?? '').trim();

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

    const email = normalizeEmail(emailRaw);
    if (emailRaw && !email) {
      errors.push(`Row ${lineNumber} has an invalid email address.`);
      continue;
    }

    const phoneNumber = normalizePhoneNumber(phoneRaw);
    if (phoneRaw && !phoneNumber) {
      errors.push(`Row ${lineNumber} has an invalid phone number. Use E.164 format.`);
      continue;
    }

    seen.add(key);
    rows.push({ id, firstName, lastName, email, phoneNumber });
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
        email: row.email,
        phoneNumber: row.phoneNumber,
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
  const email = normalizeEmail(input.email ?? '');
  const phoneNumber = normalizePhoneNumber(input.phoneNumber ?? '');

  if (!id || !firstName || !lastName) {
    return { error: 'ID, first name, and last name are required.' };
  }
  if ((input.email ?? '').trim() && !email) {
    return { error: 'Please provide a valid email address.' };
  }
  if ((input.phoneNumber ?? '').trim() && !phoneNumber) {
    return { error: 'Please provide a valid E.164 phone number, e.g. +639171234567.' };
  }

  if (attendees.some((attendee) => attendee.id.toLowerCase() === id.toLowerCase())) {
    return { error: `An attendee with id ${id} already exists.` };
  }

  return {
    attendees: [...attendees, { id, firstName, lastName, email, phoneNumber, checkedInAt: null }],
  };
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

export function normalizeEmail(value: string): string | undefined {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return undefined;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

export function normalizePhoneNumber(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (!/^\+[1-9]\d{7,14}$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

export function maskEmail(email?: string): string | undefined {
  if (!email) {
    return undefined;
  }
  const [local, domain] = email.split('@');
  if (!local || !domain) {
    return undefined;
  }
  return `${local.charAt(0)}***@${domain}`;
}

export function maskPhone(phoneNumber?: string): string | undefined {
  if (!phoneNumber) {
    return undefined;
  }
  if (phoneNumber.length < 6) {
    return '***';
  }
  return `${phoneNumber.slice(0, 4)}***${phoneNumber.slice(-3)}`;
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
