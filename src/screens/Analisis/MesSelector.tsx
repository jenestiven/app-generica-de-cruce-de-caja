import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

type MesSelectorProps = {
  mes: number;
  anio: number;
  onCambiar: (mes: number, anio: number) => void;
};

export default function MesSelector({ mes, anio, onCambiar }: MesSelectorProps) {
  function irMesAnterior() {
    if (mes === 1) {
      onCambiar(12, anio - 1);
    } else {
      onCambiar(mes - 1, anio);
    }
  }

  function irMesSiguiente() {
    if (mes === 12) {
      onCambiar(1, anio + 1);
    } else {
      onCambiar(mes + 1, anio);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.flecha} onPress={irMesAnterior} hitSlop={8}>
        <Text style={styles.flechaTexto}>‹</Text>
      </Pressable>

      <Text style={styles.mesTexto}>
        {MESES[mes - 1]} {anio}
      </Text>

      <Pressable style={styles.flecha} onPress={irMesSiguiente} hitSlop={8}>
        <Text style={styles.flechaTexto}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  flecha: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xs,
  },
  flechaTexto: {
    fontSize: 26,
    color: colors.primary,
    fontWeight: '700',
  },
  mesTexto: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 150,
    textAlign: 'center',
  },
});
