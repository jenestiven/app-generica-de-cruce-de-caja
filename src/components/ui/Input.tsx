import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type InputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
};

export default function Input({ label, error, ...textInputProps }: InputProps) {
  const hasError = error !== undefined && error.length > 0;

  return (
    <View style={styles.container}>
      <Text style={[typography.label, styles.label]}>{label}</Text>
      <TextInput
        style={[styles.input, hasError && styles.inputError]}
        placeholderTextColor={colors.textSecondary}
        {...textInputProps}
      />
      {hasError && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
