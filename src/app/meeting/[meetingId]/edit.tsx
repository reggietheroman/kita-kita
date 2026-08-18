import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useMeetings } from '@/hooks/use-meetings';
import { useTheme } from '@/hooks/use-theme';
import { confirmAction } from '@/lib/confirm';
import {
  formatMeetingDate,
  formatMeetingTime,
  parseMeetingDateTime,
} from '@/lib/meetings';

export default function EditMeetingScreen() {
  const router = useRouter();
  const { meetingId } = useLocalSearchParams<{ meetingId: string }>();
  const theme = useTheme();
  const { records, updateMeetingRecord } = useMeetings();
  const record = records.find((item) => item.meeting.id === meetingId);
  const [name, setName] = useState(record?.meeting.name ?? '');
  const initialStart = record ? new Date(record.meeting.startsAt) : null;
  const initialEnd = record ? new Date(record.meeting.endsAt) : null;
  const [date, setDate] = useState(initialStart ? initialStart.toISOString().slice(0, 10) : '');
  const [startTime, setStartTime] = useState(initialStart ? initialStart.toISOString().slice(11, 16) : '');
  const [endTime, setEndTime] = useState(initialEnd ? initialEnd.toISOString().slice(11, 16) : '');
  const [location, setLocation] = useState(record?.meeting.location ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(initialStart ?? new Date());
  const [startPickerValue, setStartPickerValue] = useState(initialStart ?? new Date());
  const [endPickerValue, setEndPickerValue] = useState(initialEnd ?? new Date());

  if (!record) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader title="Meeting not found" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const inputStyle = [styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }];

  function onDateChange(value?: Date) {
    setShowDatePicker(false);
    if (value) {
      setDatePickerValue(value);
      setDate(formatMeetingDate(value));
    }
  }

  function onStartTimeChange(value?: Date) {
    setShowStartPicker(false);
    if (value) {
      setStartPickerValue(value);
      setStartTime(formatMeetingTime(value));
    }
  }

  function onEndTimeChange(value?: Date) {
    setShowEndPicker(false);
    if (value) {
      setEndPickerValue(value);
      setEndTime(formatMeetingTime(value));
    }
  }

  function onSave() {
    const start = parseMeetingDateTime(date.trim(), startTime.trim());
    const end = parseMeetingDateTime(date.trim(), endTime.trim());
    if (!start || !end) {
      setValidationError('Use date YYYY-MM-DD and times HH:mm.');
      return;
    }
    if (end <= start) {
      setValidationError('End time must be later than start time.');
      return;
    }
    if (!name.trim() || !location.trim()) {
      setValidationError('Meeting name and location are required.');
      return;
    }
    setValidationError(null);
    confirmAction({
      title: 'Save changes?',
      message: 'Update this meeting on this device.',
      confirmLabel: 'Save',
      onConfirm: () => {
        updateMeetingRecord({
          ...record.meeting,
          name: name.trim(),
          location: location.trim(),
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
        });
        router.back();
      },
    });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          title="Edit meeting"
          actionIcon="save"
          actionAccessibilityLabel="Save"
          onAction={onSave}
        />
        <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={theme.textSecondary} style={inputStyle} />
        <AppButton title={date || 'Choose date'} variant="secondary" onPress={() => setShowDatePicker(true)} />
        {showDatePicker ? (
          <DateTimePicker
            value={datePickerValue}
            mode="date"
            display="default"
            onValueChange={(_, value) => onDateChange(value)}
            onDismiss={() => setShowDatePicker(false)}
          />
        ) : null}
        <AppButton
          title={startTime ? `Start: ${startTime}` : 'Choose start time'}
          variant="secondary"
          onPress={() => setShowStartPicker(true)}
        />
        {showStartPicker ? (
          <DateTimePicker
            value={startPickerValue}
            mode="time"
            display="default"
            onValueChange={(_, value) => onStartTimeChange(value)}
            onDismiss={() => setShowStartPicker(false)}
          />
        ) : null}
        <AppButton
          title={endTime ? `End: ${endTime}` : 'Choose end time'}
          variant="secondary"
          onPress={() => setShowEndPicker(true)}
        />
        {showEndPicker ? (
          <DateTimePicker
            value={endPickerValue}
            mode="time"
            display="default"
            onValueChange={(_, value) => onEndTimeChange(value)}
            onDismiss={() => setShowEndPicker(false)}
          />
        ) : null}
        <TextInput value={location} onChangeText={setLocation} placeholder="Location" placeholderTextColor={theme.textSecondary} style={inputStyle} />
        {validationError ? <ThemedText themeColor="textSecondary">{validationError}</ThemedText> : null}
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
  input: {
    minHeight: 42,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
