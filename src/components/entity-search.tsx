import { StyleSheet, TextInput } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type EntitySearchProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
};

export function EntitySearch({ value, onChangeText, placeholder }: EntitySearchProps) {
  const theme = useTheme();

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.textSecondary}
      autoCapitalize="none"
      autoCorrect={false}
      accessibilityRole="search"
      style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 42,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
