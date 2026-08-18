import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { EntitySearch } from '@/components/entity-search';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useMeetings } from '@/hooks/use-meetings';
import { confirmAction } from '@/lib/confirm';

export default function HomeScreen() {
  const router = useRouter();
  const { records, loaded, checkedInCount, selectMeeting, deleteMeetingRecord } = useMeetings();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...records]
      .sort((a, b) => b.meeting.startsAt.localeCompare(a.meeting.startsAt))
      .filter((item) => {
        if (!normalized) {
          return true;
        }
        return `${item.meeting.name} ${item.meeting.location}`.toLowerCase().includes(normalized);
      });
  }, [query, records]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScreenHeader
          title="Meetings"
          subtitle={loaded ? `${records.length} meeting${records.length === 1 ? '' : 's'}` : '—'}
          showBack={false}
          actionIcon="plus"
          actionAccessibilityLabel="Add meeting"
          onAction={() => router.push('/create-meeting')}
        />
        <EntitySearch value={query} onChangeText={setQuery} placeholder="Search meetings" />

        <FlatList
          style={styles.list}
          data={filtered}
          keyExtractor={(item) => item.meeting.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ThemedView type="backgroundElement" style={styles.meetingCard}>
              <View style={styles.meetingTop}>
                <ThemedText type="smallBold">{item.meeting.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {checkedInCount(item.meeting.id)} / {item.attendees.length}
                </ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {new Date(item.meeting.startsAt).toLocaleString()} –{' '}
                {new Date(item.meeting.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                - {item.meeting.location}
              </ThemedText>
              <View style={styles.rowActions}>
                <AppButton
                  icon="eye"
                  accessibilityLabel="Open"
                  variant="secondary"
                  compact
                  style={styles.action}
                  onPress={() => {
                    selectMeeting(item.meeting.id);
                    router.push({
                      pathname: '/meeting/[meetingId]',
                      params: { meetingId: item.meeting.id },
                    });
                  }}
                />
                <AppButton
                  icon="edit"
                  accessibilityLabel="Edit"
                  variant="secondary"
                  compact
                  style={styles.action}
                  onPress={() => {
                    selectMeeting(item.meeting.id);
                    router.push({
                      pathname: '/meeting/[meetingId]/edit',
                      params: { meetingId: item.meeting.id },
                    });
                  }}
                />
                <AppButton
                  title="Delete"
                  variant="danger"
                  compact
                  style={styles.action}
                  onPress={() =>
                    confirmAction({
                      title: 'Delete meeting?',
                      message: 'This removes attendees and attendance data on this device.',
                      confirmLabel: 'Delete',
                      destructive: true,
                      onConfirm: () => deleteMeetingRecord(item.meeting.id),
                    })
                  }
                />
              </View>
            </ThemedView>
          )}
          ListEmptyComponent={
            <ThemedText themeColor="textSecondary">
              {loaded ? 'No meetings yet.' : 'Loading meetings…'}
            </ThemedText>
          }
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
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.two,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  meetingCard: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  meetingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  action: {
    flexGrow: 1,
  },
});
