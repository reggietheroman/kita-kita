import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { type AppIconName } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  backLabel?: string;
  showBack?: boolean;
  actionTitle?: string;
  actionIcon?: AppIconName;
  actionAccessibilityLabel?: string;
  onAction?: () => void;
};

export function ScreenHeader({
  title,
  subtitle,
  backLabel = 'Back',
  showBack = true,
  actionTitle,
  actionIcon,
  actionAccessibilityLabel,
  onAction,
}: ScreenHeaderProps) {
  const router = useRouter();
  const hasAction = Boolean(onAction && (actionTitle || actionIcon));

  return (
    <View style={styles.wrap}>
      {showBack || hasAction ? (
        <View style={styles.topRow}>
          {showBack ? (
            <AppButton
              icon="back"
              accessibilityLabel={backLabel}
              variant="secondary"
              compact
              style={styles.backButton}
              onPress={() => router.back()}
            />
          ) : (
            <View />
          )}
          {hasAction ? (
            <AppButton
              title={actionTitle}
              icon={actionIcon}
              accessibilityLabel={actionAccessibilityLabel ?? actionTitle}
              variant="secondary"
              compact
              onPress={onAction}
            />
          ) : null}
        </View>
      ) : null}
      <View style={styles.titleBlock}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  backButton: {
    minWidth: 40,
    paddingHorizontal: Spacing.one,
  },
  titleBlock: {
    gap: Spacing.half,
  },
  title: {},
});
