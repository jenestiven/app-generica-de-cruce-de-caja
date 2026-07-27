import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type StatusBadgeProps = {
  value: string;
  positive: boolean;
};

export default function StatusBadge({ value, positive }: StatusBadgeProps) {
  const sign = positive ? '+' : '-';

  return (
    <View style={[styles.container, { backgroundColor: positive ? colors.success : colors.danger }]}>
      <Text style={styles.text}>
        {sign}
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
