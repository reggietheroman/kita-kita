import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  backLabel?: string;
  showBack?: boolean;
  actionTitle?: string;
  onAction?: () => void;
};

export function ScreenHeader({
  title,
  subtitle,
  backLabel = 'Back',
  showBack = true,
  actionTitle,
  onAction,
}: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      {showBack ? (
        <AppButton title={backLabel} variant="secondary" compact onPress={() => router.back()} />
      ) : null}
      <View style={styles.titleRow}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        {actionTitle && onAction ? (
          <AppButton title={actionTitle} variant="secondary" compact onPress={onAction} />
        ) : null}
      </View>
      {subtitle ? (
        <ThemedText type="small" themeColor="textSecondary">
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
  },
});
