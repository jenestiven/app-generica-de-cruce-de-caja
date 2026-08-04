import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import HoyView from './HoyView';
import MensualView from './MensualView';
import SegmentedControl from './SegmentedControl';

type Vista = 'hoy' | 'mensual';

export default function AnalisisScreen() {
  const [vista, setVista] = useState<Vista>('hoy');

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Análisis</Text>

      <SegmentedControl
        opciones={[
          { value: 'hoy', label: 'Hoy' },
          { value: 'mensual', label: 'Mensual' },
        ]}
        valor={vista}
        onCambiar={setVista}
      />

      {vista === 'hoy' ? <HoyView /> : <MensualView />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: spacing.xxl,
  },
  titulo: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
