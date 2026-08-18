import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { EntitySearch } from '@/components/entity-search';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useMeetings } from '@/hooks/use-meetings';
import { attendeeDisplayName, maskEmail, maskPhone } from '@/lib/attendance';
import { confirmAction } from '@/lib/confirm';

export default function MeetingPeopleScreen() {
  const router = useRouter();
  const { meetingId } = useLocalSearchParams<{ meetingId: string }>();
  const { records, importCsv, removePerson } = useMeetings();
  const record = records.find((item) => item.meeting.id === meetingId);
  const [query, setQuery] = useState('');
  const [importing, setImporting] = useState(false);

  const filtered = useMemo(() => {
    const list = record?.attendees ?? [];
    const normalized = query.trim().toLowerCase();
    return list
      .filter((attendee) =>
        `${attendee.id} ${attendeeDisplayName(attendee)} ${attendee.email ?? ''} ${attendee.phoneNumber ?? ''}`
          .toLowerCase()
          .includes(normalized),
      )
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [query, record?.attendees]);

  async function onImportCsv() {
    if (!meetingId) {
      return;
    }
    try {
      setImporting(true);
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) {
        return;
      }
      const file = new File(result.assets[0].uri);
      const summary = importCsv(meetingId, await file.text());
      const details = [
        summary.added ? `${summary.added} added` : null,
        summary.updated ? `${summary.updated} updated` : null,
        summary.errors.length ? `${summary.errors.length} row(s) skipped` : null,
      ]
        .filter(Boolean)
        .join(', ');
      Alert.alert('Import complete', details || 'No attendees imported.');
    } catch {
      Alert.alert('Import failed', 'Could not import that CSV file.');
    } finally {
      setImporting(false);
    }
  }

  if (!record) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader title="Meeting not found" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          title="People"
          subtitle={record.meeting.name}
          actionIcon="plus"
          actionAccessibilityLabel="Add person"
          onAction={() =>
            router.push({
              pathname: '/meeting/[meetingId]/person',
              params: { meetingId },
            } as Href)
          }
        />
        <EntitySearch value={query} onChangeText={setQuery} placeholder="Search people" />
        <AppButton
          title={importing ? 'Importing…' : 'Import CSV'}
          variant="secondary"
          compact
          onPress={onImportCsv}
        />
        <FlatList
          style={styles.list}
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ThemedView type="backgroundElement" style={styles.row}>
              <View style={styles.rowText}>
                <View style={styles.rowTop}>
                  <ThemedText type="smallBold">{attendeeDisplayName(item)}</ThemedText>
                  <ThemedText type="smallBold" themeColor={item.checkedInAt ? 'text' : 'textSecondary'}>
                    {item.checkedInAt ? 'In' : 'Out'}
                  </ThemedText>
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.id}
                </ThemedText>
                {item.email ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {maskEmail(item.email)}
                  </ThemedText>
                ) : null}
                {item.phoneNumber ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {maskPhone(item.phoneNumber)}
                  </ThemedText>
                ) : null}
              </View>
              <View style={styles.rowActions}>
                <AppButton
                  title="QR"
                  variant="secondary"
                  compact
                  style={styles.action}
                  onPress={() =>
                    router.push({
                      pathname: '/meeting/[meetingId]/attendee/[attendeeId]',
                      params: { meetingId, attendeeId: item.id },
                    })
                  }
                />
                <AppButton
                  icon="edit"
                  accessibilityLabel="Edit"
                  variant="secondary"
                  compact
                  style={styles.action}
                  onPress={() =>
                    router.push({
                      pathname: '/meeting/[meetingId]/person',
                      params: { meetingId, attendeeId: item.id },
                    } as Href)
                  }
                />
                <AppButton
                  title="Delete"
                  variant="danger"
                  compact
                  style={styles.action}
                  onPress={() =>
                    confirmAction({
                      title: 'Delete attendee?',
                      message: 'This will remove the attendee from this meeting.',
                      confirmLabel: 'Delete',
                      destructive: true,
                      onConfirm: () => removePerson(meetingId, item.id),
                    })
                  }
                />
              </View>
            </ThemedView>
          )}
          ListEmptyComponent={<ThemedText themeColor="textSecondary">No attendees yet.</ThemedText>}
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
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.two,
    gap: Spacing.two,
  },
  list: { flex: 1 },
  listContent: {
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  row: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    gap: Spacing.two,
  },
  rowText: { gap: Spacing.half },
  rowTop: {
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
