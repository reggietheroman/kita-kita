import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PRIVACY_POLICY_URL, SUPPORT_URL } from '@/constants/links';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function PrivacyScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScreenHeader title="Privacy" subtitle="How Tapok handles attendee data" />
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="smallBold">Local-first storage</ThemedText>
          <ThemedText themeColor="textSecondary">
            Meeting and attendee records stay on this device. There is no cloud sync service. Application state is
            encrypted before it is written to local storage; encryption keys are kept in the platform secure store.
          </ThemedText>

          <ThemedText type="smallBold">What we collect</ThemedText>
          <ThemedText themeColor="textSecondary">
            Names, optional email and phone numbers, attendee IDs, QR payloads, and check-in timestamps — only what is
            needed for attendance operations.
          </ThemedText>

          <ThemedText type="smallBold">Your rights</ThemedText>
          <ThemedText themeColor="textSecondary">
            You can view, edit, export (CSV/JSON), and delete attendee data from within the app. Event organizers are
            responsible for removing data when it is no longer needed.
          </ThemedText>

          <ThemedText type="smallBold">Camera</ThemedText>
          <ThemedText themeColor="textSecondary">
            The camera is used only to scan QR codes for check-in and device transfer. Images are not stored.
          </ThemedText>

          <AppButton
            title="Read full privacy policy"
            variant="secondary"
            accessibilityLabel="Read full privacy policy"
            onPress={() =>
              openBrowserAsync(PRIVACY_POLICY_URL, {
                presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
              })
            }
          />
          <AppButton
            title="Support"
            variant="secondary"
            accessibilityLabel="Open support page"
            onPress={() =>
              openBrowserAsync(SUPPORT_URL, {
                presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
              })
            }
          />
        </ScrollView>
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
  content: {
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
});
