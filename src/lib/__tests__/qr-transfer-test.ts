import {
  buildTransferFrames,
  isCloneTransfer,
  reconstructTransferPayload,
  serializeTransferPayload,
} from '@/lib/qr-transfer';

describe('qr transfer', () => {
  test('serializes and reconstructs payload', async () => {
    const payload = JSON.stringify({ kind: 'sync', checkedIn: [{ id: 'EMP001', checkedInAt: '2026-01-01' }] });
    const packed = await serializeTransferPayload('meeting-1', payload);
    const frames = buildTransferFrames('sync', 'meeting-1', packed);
    const reconstructed = await reconstructTransferPayload(frames);
    expect(reconstructed).toEqual({ meetingId: 'meeting-1', payloadJson: payload });
  });

  test('fails when a frame is missing', async () => {
    const packed = await serializeTransferPayload('meeting-1', JSON.stringify({ ok: true }));
    const frames = buildTransferFrames('clone', 'meeting-1', packed);
    const reconstructed = await reconstructTransferPayload(frames.slice(1));
    expect(reconstructed).toBeNull();
  });

  test('allows meeting creation only from clone transfer frames', () => {
    expect(isCloneTransfer('clone')).toBe(true);
    expect(isCloneTransfer('sync')).toBe(false);
  });

  test('reconstructs a clone payload with the copied meeting data', async () => {
    const payload = JSON.stringify({
      kind: 'clone',
      record: {
        meeting: {
          id: 'meeting-1',
          name: 'General Assembly',
          startsAt: '2026-08-20T01:00:00.000Z',
          endsAt: '2026-08-20T04:00:00.000Z',
          location: 'Hall A',
        },
        attendees: [{ id: 'EMP001', firstName: 'Jane', lastName: 'Doe', checkedInAt: null }],
      },
      key: 'meeting-key',
    });
    const packed = await serializeTransferPayload('meeting-1', payload);
    const frames = buildTransferFrames('clone', 'meeting-1', packed);

    const reconstructed = await reconstructTransferPayload(frames);

    expect(reconstructed?.meetingId).toBe('meeting-1');
    expect(JSON.parse(reconstructed?.payloadJson ?? '{}')).toMatchObject({
      kind: 'clone',
      key: 'meeting-key',
    });
  });
});
