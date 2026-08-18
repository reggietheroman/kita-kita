import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAttendance } from '@/hooks/use-attendance';
import { attendeeDisplayName, type ScanOutcome } from '@/lib/attendance';

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const { evaluateQr, confirmCheckIn } = useAttendance();
  const [locked, setLocked] = useState(false);
  const [outcome, setOutcome] = useState<ScanOutcome | { status: 'checked_in'; name: string } | null>(
    null,
  );

  function resumeScanning() {
    setOutcome(null);
    setLocked(false);
  }

  function onBarcodeScanned(result: BarcodeScanningResult) {
    if (locked) {
      return;
    }
    setLocked(true);
    setOutcome(evaluateQr(result.data));
  }

  function onConfirm(id: string, name: string) {
    confirmCheckIn(id);
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
        onBarcodeScanned={locked ? undefined : onBarcodeScanned}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <AppButton title="Close" variant="secondary" onPress={() => router.back()} />

        <ThemedView type="backgroundElement" style={styles.card}>
          {outcome == null ? (
            <ThemedText>Point the camera at an attendee QR code.</ThemedText>
          ) : null}

          {outcome?.status === 'invalid' ? (
            <>
              <ThemedText type="smallBold">Could not read that QR code</ThemedText>
              <AppButton title="Scan again" onPress={resumeScanning} />
            </>
          ) : null}

          {outcome?.status === 'not_on_list' ? (
            <>
              <ThemedText type="smallBold">Not on the attendee list</ThemedText>
              <ThemedText themeColor="textSecondary">{outcome.id}</ThemedText>
              <AppButton title="Scan again" onPress={resumeScanning} />
            </>
          ) : null}

          {outcome?.status === 'already_checked_in' ? (
            <>
              <ThemedText type="smallBold">Already checked in</ThemedText>
              <ThemedText>{attendeeDisplayName(outcome.attendee)}</ThemedText>
              <ThemedText themeColor="textSecondary">{outcome.attendee.id}</ThemedText>
              <AppButton title="Scan again" onPress={resumeScanning} />
            </>
          ) : null}

          {outcome?.status === 'match' ? (
            <>
              <ThemedText type="smallBold">Confirm check-in</ThemedText>
              <ThemedText>{attendeeDisplayName(outcome.attendee)}</ThemedText>
              <ThemedText themeColor="textSecondary">{outcome.attendee.id}</ThemedText>
              <View style={styles.row}>
                <AppButton
                  title="Confirm"
                  style={styles.flex}
                  onPress={() =>
                    onConfirm(outcome.attendee.id, attendeeDisplayName(outcome.attendee))
                  }
                />
                <AppButton title="Cancel" variant="secondary" style={styles.flex} onPress={resumeScanning} />
              </View>
            </>
          ) : null}

          {outcome?.status === 'checked_in' ? (
            <>
              <ThemedText type="smallBold">Checked in</ThemedText>
              <ThemedText>{outcome.name}</ThemedText>
              <AppButton title="Scan next" onPress={resumeScanning} />
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
