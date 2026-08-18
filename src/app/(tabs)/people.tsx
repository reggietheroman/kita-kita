import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAttendance } from '@/hooks/use-attendance';
import { useTheme } from '@/hooks/use-theme';
import { attendeeDisplayName, type Attendee } from '@/lib/attendance';

export default function PeopleScreen() {
  const theme = useTheme();
  const { attendees, addPerson, importCsv } = useAttendance();
  const [query, setQuery] = useState('');
  const [id, setId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [importing, setImporting] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const sorted = [...attendees].sort((a, b) => {
      const last = a.lastName.localeCompare(b.lastName);
      return last !== 0 ? last : a.firstName.localeCompare(b.firstName);
    });
    if (!normalized) {
      return sorted;
    }
    return sorted.filter((attendee) => {
      const haystack = `${attendee.id} ${attendeeDisplayName(attendee)}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [attendees, query]);

  async function onImportCsv() {
    try {
      setImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv',
          'text/plain',
          'text/comma-separated-values',
          'application/vnd.ms-excel',
          '*/*',
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled) {
        return;
      }
      const file = new File(result.assets[0].uri);
      const text = await file.text();
      const summary = importCsv(text);
      const details = [
        summary.added ? `${summary.added} added` : null,
        summary.updated ? `${summary.updated} updated` : null,
        summary.errors.length ? `${summary.errors.length} row(s) skipped` : null,
      ]
        .filter(Boolean)
        .join(', ');
      Alert.alert(
        'Import complete',
        details || 'No attendees were imported.',
        summary.errors.length
          ? [
              {
                text: 'Details',
                onPress: () => Alert.alert('Import issues', summary.errors.slice(0, 8).join('\n')),
              },
              { text: 'OK' },
            ]
          : [{ text: 'OK' }],
      );
    } catch {
      Alert.alert('Import failed', 'Could not read that file. Use a CSV with id, first_name, last_name.');
    } finally {
      setImporting(false);
    }
  }

  function onAddPerson() {
    const error = addPerson({ id, firstName, lastName });
    if (error) {
      Alert.alert('Could not add person', error);
      return;
    }
    setId('');
    setFirstName('');
    setLastName('');
  }

  const inputStyle = [
    styles.input,
    { color: theme.text, backgroundColor: theme.backgroundElement },
  ];

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ThemedText type="subtitle">People</ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            Import a CSV with id, first_name, and last_name, or add someone by hand. This list stays
            on the device.
          </ThemedText>

          <AppButton
            title={importing ? 'Importing…' : 'Import CSV'}
            variant="secondary"
            disabled={importing}
            onPress={onImportCsv}
          />

          <View style={styles.form}>
            <TextInput
              value={id}
              onChangeText={setId}
              placeholder="ID"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              style={inputStyle}
            />
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="words"
              style={inputStyle}
            />
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="words"
              style={inputStyle}
            />
            <AppButton title="Add person" onPress={onAddPerson} />
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search people"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            style={inputStyle}
          />

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            style={styles.flex}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <ThemedText themeColor="textSecondary">
                No people yet. Import a CSV or add the first attendee.
              </ThemedText>
            }
            renderItem={({ item }) => <PersonRow attendee={item} />}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function PersonRow({ attendee }: { attendee: Attendee }) {
  const checkedIn = Boolean(attendee.checkedInAt);
  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <View style={styles.rowText}>
        <ThemedText type="smallBold">{attendeeDisplayName(attendee)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {attendee.id}
        </ThemedText>
      </View>
      <ThemedText type="smallBold" themeColor={checkedIn ? 'text' : 'textSecondary'}>
        {checkedIn ? 'In' : 'Out'}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.two,
    gap: Spacing.three,
  },
  form: {
    gap: Spacing.two,
  },
  input: {
    minHeight: 44,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    gap: Spacing.two,
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
});
