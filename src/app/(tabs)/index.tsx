import { useRouter } from 'expo-router';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAttendance } from '@/hooks/use-attendance';

export default function HomeScreen() {
  const router = useRouter();
  const { attendees, checkedInCount, loaded, resetCheckIns } = useAttendance();
  const expected = attendees.length;

  function onClearCheckIns() {
    if (checkedInCount === 0) {
      return;
    }
    Alert.alert(
      'Clear check-ins?',
      'Everyone will be marked as not checked in. The attendee list stays on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: resetCheckIns },
      ],
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.kicker}>
          Meeting attendance
        </ThemedText>
        <ThemedText type="title" style={styles.count}>
          {loaded ? checkedInCount : '—'}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.expected}>
          of {expected} expected
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          Scan a QR code to check someone in. Each person counts once.
        </ThemedText>

        <ThemedView style={styles.actions}>
          <AppButton title="Scan QR" onPress={() => router.push('/scan')} />
          <AppButton
            title="Clear check-ins"
            variant="secondary"
            disabled={checkedInCount === 0}
            onPress={onClearCheckIns}
          />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    justifyContent: 'center',
    gap: Spacing.two,
  },
  kicker: {
    textTransform: 'uppercase',
  },
  count: {
    marginTop: Spacing.two,
  },
  expected: {
    marginBottom: Spacing.two,
  },
  hint: {
    marginBottom: Spacing.four,
  },
  actions: {
    gap: Spacing.two,
  },
});
