import { buildTransferFrames, reconstructTransferPayload, serializeTransferPayload } from '@/lib/qr-transfer';

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
});
