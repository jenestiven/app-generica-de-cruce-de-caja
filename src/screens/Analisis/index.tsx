import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
});
