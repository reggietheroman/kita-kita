import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useMeetings } from '@/hooks/use-meetings';
import { attendeeDisplayName } from '@/lib/attendance';
import { parseEnvelope, type TransferFrame } from '@/lib/qr-envelope';

export default function ScanScreen() {
  const router = useRouter();
  const { mode = 'attendee', meetingId } = useLocalSearchParams<{ mode?: 'attendee' | 'transfer'; meetingId?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const { evaluateAttendeeQr, confirmCheckIn, applyTransferFrames } = useMeetings();
  const [locked, setLocked] = useState(false);
  const [outcome, setOutcome] = useState<
    | { status: 'idle' }
    | { status: 'invalid' }
    | { status: 'unknown_meeting' }
    | { status: 'not_on_list'; id: string }
    | { status: 'already_checked_in'; id: string; name: string }
    | { status: 'match'; id: string; name: string; meetingId: string }
    | { status: 'checked_in'; name: string }
    | { status: 'transfer_progress'; received: number; total: number }
    | { status: 'transfer_done'; message: string }
    | { status: 'transfer_error'; message: string }
  >({ status: 'idle' });
  const [transferFrames, setTransferFrames] = useState<Record<number, TransferFrame>>({});
  const [transferTotal, setTransferTotal] = useState(0);
  const transferReceived = useMemo(() => Object.keys(transferFrames).length, [transferFrames]);

  function resumeScanning() {
    setOutcome({ status: 'idle' });
    setLocked(false);
    setTransferFrames({});
    setTransferTotal(0);
  }

  async function onBarcodeScanned(result: BarcodeScanningResult) {
    if (mode === 'transfer') {
      const parsed = parseEnvelope(result.data);
      if (!parsed || (parsed.t !== 'clone' && parsed.t !== 'sync')) {
        setOutcome({ status: 'transfer_error', message: 'This is not a transfer QR frame.' });
        return;
      }
      setTransferTotal(parsed.n);
      setTransferFrames((current) => ({ ...current, [parsed.i]: parsed }));
      const nextCount = Object.keys({ ...transferFrames, [parsed.i]: parsed }).length;
      setOutcome({ status: 'transfer_progress', received: nextCount, total: parsed.n });
      return;
    }

    if (locked) {
      return;
    }
    setLocked(true);
    const scan = await evaluateAttendeeQr(result.data);
    if (scan.status === 'match') {
      setOutcome({
        status: 'match',
        id: scan.attendee.id,
        name: attendeeDisplayName(scan.attendee),
        meetingId: meetingId ?? '',
      });
      return;
    }
    if (scan.status === 'already_checked_in') {
      setOutcome({
        status: 'already_checked_in',
        id: scan.attendee.id,
        name: attendeeDisplayName(scan.attendee),
      });
      return;
    }
    setOutcome(scan);
  }

  useEffect(() => {
    if (mode !== 'transfer' || transferTotal === 0 || transferReceived !== transferTotal) {
      return;
    }
    applyTransferFrames(Object.values(transferFrames)).then((applied) => {
      setOutcome(
        applied.ok
          ? { status: 'transfer_done', message: applied.message }
          : { status: 'transfer_error', message: applied.message },
      );
    });
  }, [applyTransferFrames, mode, transferFrames, transferReceived, transferTotal]);

  function onConfirm(id: string, name: string, targetMeetingId: string) {
    confirmCheckIn(targetMeetingId, id);
    setOutcome({ status: 'checked_in', name });
  }

  if (!permission) {
    return <ThemedView style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.permission}>
          <ThemedText type="subtitle">Camera access</ThemedText>
          <ThemedText themeColor="textSecondary">
            Allow camera access to scan attendee QR codes.
          </ThemedText>
          <AppButton title="Allow camera" onPress={requestPermission} />
          <AppButton title="Close" variant="secondary" onPress={() => router.back()} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={mode === 'transfer' ? onBarcodeScanned : locked ? undefined : onBarcodeScanned}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <AppButton title="Close" variant="secondary" onPress={() => router.back()} />

        <ThemedView type="backgroundElement" style={styles.card}>
          {outcome.status === 'idle' ? (
            <ThemedText>
              {mode === 'transfer'
                ? 'Point the camera at transfer QR frames.'
                : 'Point the camera at an encrypted attendee QR code.'}
            </ThemedText>
          ) : null}

          {outcome.status === 'invalid' ? (
            <>
              <ThemedText type="smallBold">Could not read that QR code</ThemedText>
              <AppButton title="Scan again" onPress={resumeScanning} />
            </>
          ) : null}

          {outcome.status === 'unknown_meeting' ? (
            <>
              <ThemedText type="smallBold">Meeting is not on this device</ThemedText>
              <AppButton title="Scan again" onPress={resumeScanning} />
            </>
          ) : null}

          {outcome.status === 'not_on_list' ? (
            <>
              <ThemedText type="smallBold">Not on the attendee list</ThemedText>
              <ThemedText themeColor="textSecondary">{outcome.id}</ThemedText>
              <AppButton title="Scan again" onPress={resumeScanning} />
            </>
          ) : null}

          {outcome.status === 'already_checked_in' ? (
            <>
              <ThemedText type="smallBold">Already checked in</ThemedText>
              <ThemedText>{outcome.name}</ThemedText>
              <ThemedText themeColor="textSecondary">{outcome.id}</ThemedText>
              <AppButton title="Scan again" onPress={resumeScanning} />
            </>
          ) : null}

          {outcome.status === 'match' ? (
            <>
              <ThemedText type="smallBold">Confirm check-in</ThemedText>
              <ThemedText>{outcome.name}</ThemedText>
              <ThemedText themeColor="textSecondary">{outcome.id}</ThemedText>
              <View style={styles.row}>
                <AppButton
                  title="Confirm"
                  style={styles.flex}
                  onPress={() => onConfirm(outcome.id, outcome.name, outcome.meetingId)}
                />
                <AppButton title="Cancel" variant="secondary" style={styles.flex} onPress={resumeScanning} />
              </View>
            </>
          ) : null}

          {outcome.status === 'checked_in' ? (
            <>
              <ThemedText type="smallBold">Checked in</ThemedText>
              <ThemedText>{outcome.name}</ThemedText>
              <AppButton title="Scan next" onPress={resumeScanning} />
            </>
          ) : null}

          {outcome.status === 'transfer_progress' ? (
            <>
              <ThemedText type="smallBold">Scanning transfer frames</ThemedText>
              <ThemedText themeColor="textSecondary">
                {outcome.received} of {outcome.total} frames captured
              </ThemedText>
            </>
          ) : null}

          {outcome.status === 'transfer_done' ? (
            <>
              <ThemedText type="smallBold">Transfer complete</ThemedText>
              <ThemedText themeColor="textSecondary">{outcome.message}</ThemedText>
              <AppButton title="Done" onPress={() => router.back()} />
            </>
          ) : null}

          {outcome.status === 'transfer_error' ? (
            <>
              <ThemedText type="smallBold">Transfer failed</ThemedText>
              <ThemedText themeColor="textSecondary">{outcome.message}</ThemedText>
              <AppButton title="Scan again" onPress={resumeScanning} />
            </>
          ) : null}
        </ThemedView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permission: {
    flex: 1,
    padding: Spacing.four,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: Spacing.three,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
});
