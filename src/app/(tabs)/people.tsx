import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useMeetings } from '@/hooks/use-meetings';

export default function PeopleScreen() {
  const router = useRouter();
  const { records, selectMeeting } = useMeetings();
  const meeting = records[0];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedText type="subtitle">People now belong to meetings</ThemedText>
        <ThemedText themeColor="textSecondary">
          Open a meeting and manage its attendees there.
        </ThemedText>
        <AppButton
          title="Go to first meeting"
          disabled={!meeting}
          onPress={() => {
            if (!meeting) {
              return;
            }
            selectMeeting(meeting.meeting.id);
            router.push({
              pathname: '/meeting/[meetingId]',
              params: { meetingId: meeting.meeting.id },
            });
          }}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.two,
    gap: Spacing.two,
  },
});
