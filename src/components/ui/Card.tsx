import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type CardBackground = 'surface' | 'background';

type CardProps = {
  children: ReactNode;
  background?: CardBackground;
  style?: StyleProp<ViewStyle>;
};

export default function Card({ children, background = 'surface', style }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: background === 'surface' ? colors.surface : colors.background },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
});
