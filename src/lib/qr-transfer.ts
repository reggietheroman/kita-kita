import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto';
import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate';

import type { TransferFrame } from '@/lib/qr-envelope';

const CHUNK_SIZE = 800;

type TransferPayload = {
  m: string;
  c: string;
  p: string;
};

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function serializeTransferPayload(
  meetingId: string,
  payloadJson: string,
): Promise<string> {
  const checksum = await digestStringAsync(CryptoDigestAlgorithm.SHA256, payloadJson);
  const payload: TransferPayload = { m: meetingId, c: checksum, p: payloadJson };
  const compressed = zlibSync(strToU8(JSON.stringify(payload)));
  return toBase64(compressed);
}

export function buildTransferFrames(
  type: 'clone' | 'sync',
  meetingId: string,
  compressedBase64: string,
): TransferFrame[] {
  const total = Math.max(1, Math.ceil(compressedBase64.length / CHUNK_SIZE));
  const frames: TransferFrame[] = [];
  for (let index = 0; index < total; index += 1) {
    frames.push({
      v: 1,
      t: type,
      m: meetingId,
      i: index,
      n: total,
      d: compressedBase64.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
    });
  }
  return frames;
}

export async function reconstructTransferPayload(frames: TransferFrame[]): Promise<{
  meetingId: string;
  payloadJson: string;
} | null> {
  if (!frames.length) {
    return null;
  }
  const first = frames[0];
  const total = first.n;
  if (total <= 0) {
    return null;
  }
  const byIndex = new Map(frames.map((frame) => [frame.i, frame]));
  if (byIndex.size !== total) {
    return null;
  }
  for (let i = 0; i < total; i += 1) {
    const frame = byIndex.get(i);
    if (!frame || frame.m !== first.m || frame.t !== first.t || frame.n !== total) {
      return null;
    }
  }

  const combined = Array.from({ length: total }, (_, i) => byIndex.get(i)!.d).join('');
  const compressedBytes = fromBase64(combined);
  const json = strFromU8(unzlibSync(compressedBytes));
  const parsed: unknown = JSON.parse(json);
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }
  const payload = parsed as TransferPayload;
  if (payload.m !== first.m || typeof payload.p !== 'string' || typeof payload.c !== 'string') {
    return null;
  }

  const checksum = await digestStringAsync(CryptoDigestAlgorithm.SHA256, payload.p);
  if (checksum !== payload.c) {
    return null;
  }
  return { meetingId: payload.m, payloadJson: payload.p };
}
