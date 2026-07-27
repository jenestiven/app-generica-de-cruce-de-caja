import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Card from '../../components/ui/Card';
import { getResumenHoy, type ResumenHoy } from '../../db/analisis';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatPrecio } from '../Menu/formatPrecio';

export default function HoyView() {
  const [resumen, setResumen] = useState<ResumenHoy>(() => getResumenHoy());

  useFocusEffect(
    useCallback(() => {
      setResumen(getResumenHoy());
    }, [])
  );

  const { totalVentas, totalGastos, utilidadNeta, cerrado, diferencia } = resumen;
  const diferenciaValor = diferencia ?? 0;
  const cuadra = diferenciaValor === 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      {!cerrado && (
        <View style={styles.banner}>
          <Text style={styles.bannerTexto}>
            La caja de hoy sigue abierta. Estos números son parciales.
          </Text>
        </View>
      )}

      <Card style={styles.tarjeta}>
        <Text style={styles.tarjetaLabel}>Total vendido hoy</Text>
        <Text style={styles.tarjetaValor}>{formatPrecio(totalVentas)}</Text>
      </Card>

      <Card style={styles.tarjeta}>
        <Text style={styles.tarjetaLabel}>Total gastado hoy</Text>
        <Text style={styles.tarjetaValor}>{formatPrecio(totalGastos)}</Text>
      </Card>

      <Card style={styles.tarjeta}>
        <Text style={styles.tarjetaLabel}>Utilidad neta hoy</Text>
        <Text style={styles.tarjetaValor}>{formatPrecio(utilidadNeta)}</Text>
      </Card>

      {cerrado && (
        <Card style={styles.tarjeta}>
          <Text style={styles.tarjetaLabel}>Diferencia de caja</Text>
          <Text style={[styles.tarjetaValor, cuadra ? styles.textoVerde : styles.textoRojo]}>
            {cuadra
              ? 'Cuadró exacto'
              : diferenciaValor > 0
                ? `Sobró ${formatPrecio(diferenciaValor)}`
                : `Faltó ${formatPrecio(Math.abs(diferenciaValor))}`}
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contenido: {
    padding: spacing.lg,
  },
  banner: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerTexto: {
    ...typography.label,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '600',
  },
  tarjeta: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tarjetaLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  tarjetaValor: {
    ...typography.numberLarge,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  textoVerde: {
    color: colors.success,
  },
  textoRojo: {
    color: colors.danger,
  },
});
