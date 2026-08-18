import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useMeetings } from '@/hooks/use-meetings';
import { useTheme } from '@/hooks/use-theme';
import { confirmAction } from '@/lib/confirm';

export default function PersonFormScreen() {
  const router = useRouter();
  const { meetingId, attendeeId } = useLocalSearchParams<{ meetingId: string; attendeeId?: string }>();
  const theme = useTheme();
  const { records, addPerson, updatePerson } = useMeetings();
  const record = records.find((item) => item.meeting.id === meetingId);
  const attendee = attendeeId
    ? record?.attendees.find((item) => item.id.toLowerCase() === attendeeId.toLowerCase())
    : undefined;
  const isEditing = Boolean(attendeeId);
  const [id, setId] = useState(attendee?.id ?? '');
  const [firstName, setFirstName] = useState(attendee?.firstName ?? '');
  const [lastName, setLastName] = useState(attendee?.lastName ?? '');
  const [email, setEmail] = useState(attendee?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(attendee?.phoneNumber ?? '');

  if (!record) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader title="Person not found" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (isEditing && !attendee) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader title="Attendee not found" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const inputStyle = [styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }];
  const input = { id, firstName, lastName, email, phoneNumber };

  function persist() {
    if (!meetingId) {
      return;
    }
    const error = isEditing && attendeeId
      ? updatePerson(meetingId, attendeeId, input)
      : addPerson(meetingId, input);
    if (error) {
      Alert.alert(isEditing ? 'Could not update attendee' : 'Could not add attendee', error);
      return;
    }
    router.back();
  }

  function onSave() {
    if (isEditing) {
      confirmAction({
        title: 'Save changes?',
        message: 'Update this attendee on this device.',
        confirmLabel: 'Save',
        onConfirm: persist,
      });
      return;
    }
    persist();
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          title={isEditing ? 'Edit person' : 'Add person'}
          subtitle={record.meeting.name}
        />
        <TextInput
          value={id}
          onChangeText={setId}
          placeholder="ID"
          placeholderTextColor={theme.textSecondary}
          style={inputStyle}
        />
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          placeholderTextColor={theme.textSecondary}
          style={inputStyle}
        />
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          placeholderTextColor={theme.textSecondary}
          style={inputStyle}
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email (optional)"
          placeholderTextColor={theme.textSecondary}
          style={inputStyle}
          autoCapitalize="none"
        />
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Phone (optional, +63...)"
          placeholderTextColor={theme.textSecondary}
          style={inputStyle}
        />
        <AppButton title={isEditing ? 'Save' : 'Add person'} onPress={onSave} />
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
    padding: Spacing.four,
    gap: Spacing.two,
  },
  input: {
    minHeight: 42,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
