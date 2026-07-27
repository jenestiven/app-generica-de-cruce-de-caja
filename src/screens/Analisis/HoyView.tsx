import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getResumenHoy, type ResumenHoy } from '../../db/analisis';
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

      <View style={styles.tarjeta}>
        <Text style={styles.tarjetaLabel}>Total vendido hoy</Text>
        <Text style={styles.tarjetaValor}>{formatPrecio(totalVentas)}</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.tarjetaLabel}>Total gastado hoy</Text>
        <Text style={styles.tarjetaValor}>{formatPrecio(totalGastos)}</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.tarjetaLabel}>Utilidad neta hoy</Text>
        <Text style={styles.tarjetaValor}>{formatPrecio(utilidadNeta)}</Text>
      </View>

      {cerrado && (
        <View style={styles.tarjeta}>
          <Text style={styles.tarjetaLabel}>Diferencia de caja</Text>
          <Text style={[styles.tarjetaValor, cuadra ? styles.textoVerde : styles.textoRojo]}>
            {cuadra
              ? 'Cuadró exacto'
              : diferenciaValor > 0
                ? `Sobró ${formatPrecio(diferenciaValor)}`
                : `Faltó ${formatPrecio(Math.abs(diferenciaValor))}`}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contenido: {
    padding: 16,
  },
  banner: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  bannerTexto: {
    fontSize: 13,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '600',
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: 'center',
  },
  tarjetaLabel: {
    fontSize: 14,
    color: '#555',
  },
  tarjetaValor: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginTop: 4,
  },
  textoVerde: {
    color: '#16a34a',
  },
  textoRojo: {
    color: '#dc2626',
  },
});
