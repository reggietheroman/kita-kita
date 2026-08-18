import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Share, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useMeetings } from '@/hooks/use-meetings';
import { attendeeDisplayName } from '@/lib/attendance';

export default function AttendeeQrScreen() {
  const { meetingId, attendeeId } = useLocalSearchParams<{ meetingId: string; attendeeId: string }>();
  const { records, createAttendeeQr } = useMeetings();
  const record = records.find((item) => item.meeting.id === meetingId);
  const attendee = record?.attendees.find((item) => item.id === attendeeId);
  const [qrValue, setQrValue] = useState<string>('');

  useEffect(() => {
    if (!meetingId || !attendeeId) {
      return;
    }
    createAttendeeQr(meetingId, attendeeId).then((value) => setQrValue(value ?? ''));
  }, [attendeeId, createAttendeeQr, meetingId]);

  if (!record || !attendee) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader title="Attendee not found" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          title={attendeeDisplayName(attendee)}
          subtitle={attendee.id}
          actionTitle="Share"
          onAction={() => Share.share({ message: qrValue || `${record.meeting.name} attendee QR` })}
        />
        <ThemedView type="backgroundElement" style={styles.qrWrap}>
          {qrValue ? <QRCode value={qrValue} size={240} /> : <ThemedText>Generating QR...</ThemedText>}
        </ThemedView>
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
    gap: Spacing.three,
    padding: Spacing.four,
  },
  qrWrap: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
