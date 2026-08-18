import { encodeEnvelope, parseEnvelope } from '@/lib/qr-envelope';

describe('qr envelope', () => {
  test('round-trips attendee envelope', () => {
    const encoded = encodeEnvelope({ v: 1, t: 'a', m: 'meeting-1', c: 'ciphertext' });
    expect(parseEnvelope(encoded)).toEqual({ v: 1, t: 'a', m: 'meeting-1', c: 'ciphertext' });
  });

  test('round-trips transfer frame envelope', () => {
    const encoded = encodeEnvelope({ v: 1, t: 'sync', m: 'meeting-1', i: 1, n: 4, d: 'part' });
    expect(parseEnvelope(encoded)).toEqual({ v: 1, t: 'sync', m: 'meeting-1', i: 1, n: 4, d: 'part' });
  });

  test('rejects invalid payload', () => {
    expect(parseEnvelope('not-json')).toBeNull();
  });
});
