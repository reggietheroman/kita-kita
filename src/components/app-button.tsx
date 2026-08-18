import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppButtonProps = Omit<PressableProps, 'style'> & {
  title?: string;
  icon?: AppIconName;
  variant?: 'primary' | 'secondary' | 'danger';
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  icon,
  variant = 'primary',
  compact = false,
  disabled,
  style,
  ...props
}: AppButtonProps) {
  const theme = useTheme();
  const backgroundColor =
    variant === 'primary' ? theme.text : variant === 'danger' ? '#c62828' : theme.backgroundElement;
  const color = variant === 'secondary' ? theme.text : variant === 'danger' ? '#ffffff' : theme.background;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        compact ? styles.compact : styles.button,
        { backgroundColor, opacity: disabled ? 0.5 : pressed ? 0.75 : 1 },
        style,
      ]}
      {...props}>
      {icon ? <AppIcon name={icon} size={compact ? 16 : 20} color={color} /> : null}
      {title ? (
        <ThemedText type="smallBold" style={[styles.label, { color }]}>
          {title}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  compact: {
    minHeight: 36,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  label: {
    textAlign: 'center',
  },
});
