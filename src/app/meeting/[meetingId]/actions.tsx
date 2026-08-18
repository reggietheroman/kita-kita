import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useMeetings } from '@/hooks/use-meetings';
import { confirmAction } from '@/lib/confirm';

export default function MeetingActionsScreen() {
  const router = useRouter();
  const { meetingId } = useLocalSearchParams<{ meetingId: string }>();
  const { records, resetCheckIns, deleteMeetingRecord } = useMeetings();
  const record = records.find((item) => item.meeting.id === meetingId);

  if (!record) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader title="Meeting not found" backLabel="Back" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Meeting actions" subtitle={record.meeting.name} />

        <AppButton
          title="Show attendance QR"
          onPress={() =>
            router.push({
              pathname: '/meeting/[meetingId]/transfer',
              params: { meetingId, type: 'sync' },
            })
          }
        />
        <AppButton
          title="Copy meeting QR"
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: '/meeting/[meetingId]/transfer',
              params: { meetingId, type: 'clone' },
            })
          }
        />
        <AppButton
          title="Scan from another device"
          variant="secondary"
          onPress={() => router.push({ pathname: '/scan', params: { mode: 'transfer' } })}
        />
        <AppButton
          title="Clear check-ins"
          variant="secondary"
          onPress={() =>
            confirmAction({
              title: 'Clear check-ins?',
              message: 'Everyone will be marked as not checked in.',
              confirmLabel: 'Clear',
              destructive: true,
              onConfirm: () => resetCheckIns(record.meeting.id),
            })
          }
        />
        <AppButton
          title="Delete meeting"
          variant="danger"
          onPress={() =>
            confirmAction({
              title: 'Delete meeting?',
              message: 'This removes attendees and attendance data on this device.',
              confirmLabel: 'Delete',
              destructive: true,
              onConfirm: () => {
                deleteMeetingRecord(record.meeting.id);
                router.replace('/');
              },
            })
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
});
