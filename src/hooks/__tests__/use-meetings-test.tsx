import { render, screen, waitFor } from '@testing-library/react-native';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { MeetingsProvider, useMeetings } from '@/hooks/use-meetings';
import { buildTransferFrames, serializeTransferPayload } from '@/lib/qr-transfer';

jest.mock('@/lib/storage', () => ({
  loadState: jest.fn(() =>
    Promise.resolve({
      selectedMeetingId: null,
      records: [],
      meetingKeys: {},
    }),
  ),
  saveState: jest.fn(() => Promise.resolve()),
}));

function TransferHarness({
  frames,
  mode,
}: {
  frames: Awaited<ReturnType<typeof buildTransferFrames>>;
  mode: 'transfer' | 'create-meeting';
}) {
  const { loaded, records, applyTransferFrames } = useMeetings();
  const [result, setResult] = useState('pending');

  useEffect(() => {
    if (!loaded) {
      return;
    }
    applyTransferFrames(frames, mode).then((next) => setResult(JSON.stringify(next)));
  }, [applyTransferFrames, frames, loaded, mode]);

  return (
    <View>
      <Text testID="result">{result}</Text>
      <Text testID="records">{records.map((record) => record.meeting.id).join(',')}</Text>
    </View>
  );
}

async function buildCloneFrames() {
  const payload = JSON.stringify({
    kind: 'clone',
    record: {
      meeting: {
        id: 'meeting-from-device',
        name: 'Shared Meeting',
        startsAt: '2026-08-20T01:00:00.000Z',
        endsAt: '2026-08-20T04:00:00.000Z',
        location: 'Hall A',
      },
      attendees: [],
    },
    key: 'shared-meeting-key',
  });
  return buildTransferFrames('clone', 'meeting-from-device', await serializeTransferPayload('meeting-from-device', payload));
}

async function buildSyncFrames() {
  const payload = JSON.stringify({
    kind: 'sync',
    meetingId: 'meeting-from-device',
    sealed: 'sealed-attendance',
  });
  return buildTransferFrames('sync', 'meeting-from-device', await serializeTransferPayload('meeting-from-device', payload));
}

describe('meeting transfer application', () => {
  test('creates a meeting from clone frames and returns its ID', async () => {
    const frames = await buildCloneFrames();

    render(
      <MeetingsProvider>
        <TransferHarness frames={frames} mode="create-meeting" />
      </MeetingsProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('result').props.children).toContain('meeting-from-device'));
    expect(screen.getByTestId('records').props.children).toContain('meeting-from-device');
  });

  test('rejects attendance-sync frames in create-meeting mode', async () => {
    const frames = await buildSyncFrames();

    render(
      <MeetingsProvider>
        <TransferHarness frames={frames} mode="create-meeting" />
      </MeetingsProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('result').props.children).toContain(
        'Attendance-sync QR codes cannot create meetings',
      ),
    );
    expect(screen.getByTestId('records').props.children).toBe('');
  });
});
