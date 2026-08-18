import {
  AESEncryptionKey,
  AESSealedData,
  aesDecryptAsync,
  aesEncryptAsync,
  getRandomBytes,
} from 'expo-crypto';

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

function aadForMeeting(meetingId: string): Uint8Array {
  return new TextEncoder().encode(meetingId);
}

export async function generateMeetingKey(): Promise<string> {
  const key = await AESEncryptionKey.generate();
  return key.encoded('base64');
}

export function generateRandomToken(bytes = 16): string {
  return toBase64(getRandomBytes(bytes));
}

async function importKey(base64: string): Promise<AESEncryptionKey> {
  return AESEncryptionKey.import(base64, 'base64');
}

export async function sealForMeeting(
  meetingId: string,
  keyBase64: string,
  plaintextUtf8: string,
): Promise<string> {
  const key = await importKey(keyBase64);
  const plaintext = new TextEncoder().encode(plaintextUtf8);
  const sealed = await aesEncryptAsync(plaintext, key, {
    additionalData: aadForMeeting(meetingId),
  });
  const combined = await sealed.combined();
  return toBase64(combined);
}

export async function openForMeeting(
  meetingId: string,
  keyBase64: string,
  combinedBase64: string,
): Promise<string> {
  const key = await importKey(keyBase64);
  const sealed = AESSealedData.fromCombined(fromBase64(combinedBase64));
  const plaintext = await aesDecryptAsync(sealed, key, {
    output: 'bytes',
    additionalData: aadForMeeting(meetingId),
  });
  return new TextDecoder().decode(plaintext as Uint8Array);
}
