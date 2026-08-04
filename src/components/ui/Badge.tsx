import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type BadgeProps = {
  label: string;
};

// Etiqueta neutral en forma de píldora, mismo lenguaje visual que StatusBadge
// pero sin la semántica de +/- positivo/negativo (ej. "Corregido").
export default function Badge({ label }: BadgeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.textSecondary,
  },
  text: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
