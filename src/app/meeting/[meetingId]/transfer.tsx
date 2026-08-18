import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useMeetings } from '@/hooks/use-meetings';

export default function TransferScreen() {
  const { meetingId, type } = useLocalSearchParams<{ meetingId: string; type: 'clone' | 'sync' }>();
  const { records, buildCloneTransferQrs, buildSyncTransferQrs } = useMeetings();
  const record = records.find((item) => item.meeting.id === meetingId);
  const [frames, setFrames] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!meetingId || !type) {
        return;
      }
      const next = type === 'clone' ? await buildCloneTransferQrs(meetingId) : await buildSyncTransferQrs(meetingId);
      if (mounted) {
        setFrames(next);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [buildCloneTransferQrs, buildSyncTransferQrs, meetingId, type]);

  useEffect(() => {
    if (frames.length <= 1) {
      return;
    }
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % frames.length);
    }, 300);
    return () => clearInterval(timer);
  }, [frames.length]);

  const title = useMemo(() => (type === 'clone' ? 'Copy meeting QR' : 'Attendance sync QR'), [type]);

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
        <ScreenHeader title={title} subtitle={record.meeting.name} />
        <ThemedText themeColor="textSecondary" type="small">
          {type === 'clone'
            ? 'Anyone who captures all frames can copy this meeting. Show only to trusted staff.'
            : 'Scan these frames on another device with the same meeting to merge attendance.'}
        </ThemedText>
        <ThemedView type="backgroundElement" style={styles.qrWrap}>
          {frames.length > 0 ? <QRCode value={frames[index]} size={240} /> : <ThemedText>Preparing transfer...</ThemedText>}
        </ThemedView>
        <ThemedText type="small" themeColor="textSecondary">
          Frame {Math.min(index + 1, frames.length)} / {Math.max(frames.length, 1)}
        </ThemedText>
        <AppButton title="Restart loop" variant="secondary" onPress={() => setIndex(0)} />
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
    gap: Spacing.three,
  },
  qrWrap: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
