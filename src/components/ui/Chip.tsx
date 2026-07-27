import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export default function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.base, selected ? styles.selected : styles.unselected]}>
      <Text style={[typography.label, selected ? styles.textSelected : styles.textUnselected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  unselected: {
    backgroundColor: colors.surface,
  },
  textSelected: {
    color: '#FFFFFF',
  },
  textUnselected: {
    color: colors.textSecondary,
  },
});
