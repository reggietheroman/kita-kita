export type AttendeeQrEnvelope = {
  v: 1;
  t: 'a';
  m: string;
  c: string;
};

export type TransferFrame = {
  v: 1;
  t: 'clone' | 'sync';
  m: string;
  i: number;
  n: number;
  d: string;
};

export function encodeEnvelope(value: AttendeeQrEnvelope | TransferFrame): string {
  return JSON.stringify(value);
}

export function parseEnvelope(raw: string): AttendeeQrEnvelope | TransferFrame | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    const record = parsed as Record<string, unknown>;
    if (record.v !== 1 || typeof record.t !== 'string') {
      return null;
    }
    if (record.t === 'a') {
      if (typeof record.m === 'string' && typeof record.c === 'string') {
        return { v: 1, t: 'a', m: record.m, c: record.c };
      }
      return null;
    }
    if ((record.t === 'clone' || record.t === 'sync') && typeof record.m === 'string') {
      if (
        typeof record.i === 'number' &&
        typeof record.n === 'number' &&
        typeof record.d === 'string'
      ) {
        return {
          v: 1,
          t: record.t,
          m: record.m,
          i: record.i,
          n: record.n,
          d: record.d,
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}
