import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useMeetings } from '@/hooks/use-meetings';

export default function MeetingDetailScreen() {
  const router = useRouter();
  const { meetingId } = useLocalSearchParams<{ meetingId: string }>();
  const { records, checkedInCount } = useMeetings();
  const record = records.find((item) => item.meeting.id === meetingId);

  if (!record) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader title="Meeting not found" backLabel="Back to meetings" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const checkedIn = checkedInCount(record.meeting.id);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title={record.meeting.name} backLabel="Back to meetings" />
        <ThemedText type="small" themeColor="textSecondary">
          {new Date(record.meeting.startsAt).toLocaleDateString()}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {new Date(record.meeting.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
          {new Date(record.meeting.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {record.meeting.location}
        </ThemedText>
        <ThemedText type="subtitle">
          {checkedIn} of {record.attendees.length} expected
        </ThemedText>

        <View style={styles.actions}>
          <AppButton
            title="Scan attendee QR"
            onPress={() => router.push({ pathname: '/scan', params: { mode: 'attendee', meetingId } })}
          />
          <AppButton
            title="Manage people"
            variant="secondary"
            onPress={() => router.push({ pathname: '/meeting/[meetingId]/people', params: { meetingId } })}
          />
          <AppButton
            title="Edit meeting"
            variant="secondary"
            onPress={() => router.push({ pathname: '/meeting/[meetingId]/edit', params: { meetingId } })}
          />
          <AppButton
            title="Meeting actions"
            variant="secondary"
            onPress={() =>
              router.push({ pathname: '/meeting/[meetingId]/actions', params: { meetingId } })
            }
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.two,
  },
  actions: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
});
