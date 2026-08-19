import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useMeetings } from '@/hooks/use-meetings';
import { useTheme } from '@/hooks/use-theme';
import { formatMeetingDate, formatMeetingTime, parseMeetingDateTime } from '@/lib/meetings';

export default function CreateMeetingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { createMeetingRecord, selectMeeting } = useMeetings();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [datePickerValue] = useState(new Date());
  const [startPickerValue, setStartPickerValue] = useState(new Date());
  const [endPickerValue, setEndPickerValue] = useState(new Date());

  async function onCreateMeeting() {
    if (!name.trim() || !date.trim() || !startTime.trim() || !endTime.trim() || !location.trim()) {
      setValidationError('Meeting name, date, start time, end time, and location are required.');
      return;
    }
    const start = parseMeetingDateTime(date.trim(), startTime.trim());
    const end = parseMeetingDateTime(date.trim(), endTime.trim());
    if (!start || !end) {
      setValidationError('Choose a valid date, start time, and end time.');
      return;
    }
    if (end <= start) {
      setValidationError('End time must be later than start time.');
      return;
    }
    try {
      const meetingId = await createMeetingRecord({
        name,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        location,
      });
      selectMeeting(meetingId);
      router.replace({ pathname: '/meeting/[meetingId]', params: { meetingId } });
    } catch {
      setValidationError('Could not create the meeting. Please try again.');
    }
  }

  function onDateChange(value?: Date) {
    setShowDatePicker(false);
    if (value) setDate(formatMeetingDate(value));
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

  const inputStyle = [styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Create meeting" actionTitle="Create" onAction={onCreateMeeting} />
        <TextInput value={name} onChangeText={setName} placeholder="Meeting name" placeholderTextColor={theme.textSecondary} style={inputStyle} />
        {Platform.OS === 'web' ? (
          <>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor={theme.textSecondary}
              style={inputStyle}
            />
            <View style={styles.timeRow}>
              <TextInput
                value={startTime}
                onChangeText={setStartTime}
                placeholder="Start time (HH:mm)"
                placeholderTextColor={theme.textSecondary}
                style={[inputStyle, styles.timeInput]}
              />
              <TextInput
                value={endTime}
                onChangeText={setEndTime}
                placeholder="End time (HH:mm)"
                placeholderTextColor={theme.textSecondary}
                style={[inputStyle, styles.timeInput]}
              />
            </View>
          </>
        ) : (
          <>
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
            <View style={styles.timeRow}>
              <AppButton title={startTime ? `Start: ${startTime}` : 'Choose start time'} variant="secondary" style={styles.timeInput} onPress={() => setShowStartPicker(true)} />
              <AppButton title={endTime ? `End: ${endTime}` : 'Choose end time'} variant="secondary" style={styles.timeInput} onPress={() => setShowEndPicker(true)} />
            </View>
            {showStartPicker ? (
              <DateTimePicker
                value={startPickerValue}
                mode="time"
                display="default"
                onValueChange={(_, value) => onStartTimeChange(value)}
                onDismiss={() => setShowStartPicker(false)}
              />
            ) : null}
            {showEndPicker ? (
              <DateTimePicker
                value={endPickerValue}
                mode="time"
                display="default"
                onValueChange={(_, value) => onEndTimeChange(value)}
                onDismiss={() => setShowEndPicker(false)}
              />
            ) : null}
          </>
        )}
        <TextInput value={location} onChangeText={setLocation} placeholder="Location" placeholderTextColor={theme.textSecondary} style={inputStyle} />
        {validationError ? <ThemedText style={styles.error}>{validationError}</ThemedText> : null}
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
    minHeight: 44,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  timeRow: { flexDirection: 'row', gap: Spacing.two },
  timeInput: { flex: 1 },
  error: { color: '#c62828' },
});
