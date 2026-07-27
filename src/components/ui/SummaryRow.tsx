import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type SummaryRowVariant = 'default' | 'total';

type SummaryRowProps = {
  label: string;
  value?: string;
  valueElement?: ReactNode;
  variant?: SummaryRowVariant;
};

export default function SummaryRow({ label, value, valueElement, variant = 'default' }: SummaryRowProps) {
  const isTotal = variant === 'total';

  return (
    <View style={[styles.container, isTotal && styles.containerTotal]}>
      <Text style={[styles.text, isTotal && styles.textTotal, styles.label]}>{label}</Text>
      {valueElement ?? <Text style={[styles.text, isTotal && styles.textTotal]}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  containerTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
    paddingTop: spacing.md,
  },
  text: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  label: {
    color: colors.textSecondary,
  },
  textTotal: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
});
