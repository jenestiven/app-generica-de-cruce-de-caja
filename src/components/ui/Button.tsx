import { Pressable, StyleSheet, Text } from 'react-native';
import type { ReactNode } from 'react';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = {
  onPress: () => void;
  children: ReactNode;
  disabled?: boolean;
  variant?: ButtonVariant;
};

export default function Button({
  onPress,
  children,
  disabled = false,
  variant = 'primary',
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && !disabled && (variant === 'primary' ? styles.primaryPressed : styles.secondaryPressed),
        disabled && styles.disabled,
      ]}
    >
      <Text style={variant === 'primary' ? styles.textPrimary : styles.textSecondary}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryPressed: {
    backgroundColor: colors.primaryDark,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryPressed: {
    backgroundColor: colors.surface,
  },
  disabled: {
    opacity: 0.5,
  },
  textPrimary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  textSecondary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
