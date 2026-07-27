import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type StepperControlProps = {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
};

export default function StepperControl({
  value,
  onIncrement,
  onDecrement,
  min,
  max,
}: StepperControlProps) {
  const decrementDisabled = min !== undefined && value <= min;
  const incrementDisabled = max !== undefined && value >= max;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onDecrement}
        disabled={decrementDisabled}
        style={[styles.button, decrementDisabled && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>−</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        onPress={onIncrement}
        disabled={incrementDisabled}
        style={[styles.button, incrementDisabled && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  button: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.border,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
});
