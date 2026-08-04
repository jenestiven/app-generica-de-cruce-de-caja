import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import Card from '../../components/ui/Card';
import { getCajaDeHoy } from '../../db/cierresCaja';
import { crearGasto, getGastosDeHoy, getTotalGastadoHoy } from '../../db/gastos';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { CierreCaja } from '../../types/caja';
import type { Gasto, TotalGastadoHoy } from '../../types/gasto';
import AbrirCaja from '../Caja/AbrirCaja';
import ResumenCierre from '../Caja/ResumenCierre';
import { formatPrecio } from '../Menu/formatPrecio';
import { METODO_PAGO_LABEL } from '../Vender/metodoPago';
import { CATEGORIA_GASTO_LABEL } from './categoriaGasto';
import GastoForm, { type GastoFormData } from './GastoForm';

function formatHora(fechaHora: string): string {
  return new Date(fechaHora).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function GastosScreen() {
  const [caja, setCaja] = useState<CierreCaja | null>(() => getCajaDeHoy());
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [totalHoy, setTotalHoy] = useState<TotalGastadoHoy>(() => getTotalGastadoHoy());

  const cargarDatos = useCallback(() => {
    setGastos(getGastosDeHoy());
    setTotalHoy(getTotalGastadoHoy());
  }, []);

  useFocusEffect(
    useCallback(() => {
      setCaja(getCajaDeHoy());
      cargarDatos();
    }, [cargarDatos])
  );

  function handleGuardarGasto(data: GastoFormData) {
    crearGasto(data);
    cargarDatos();
  }

  function handleCajaAbierta(cierre: CierreCaja) {
    setCaja(cierre);
    cargarDatos();
  }

  if (caja === null) {
    return <AbrirCaja onCajaAbierta={handleCajaAbierta} />;
  }

  if (caja.cerrado) {
    return <ResumenCierre cierre={caja} nota="La caja de hoy ya está cerrada. No se pueden registrar más gastos." />;
  }

  const gastosRecientesPrimero = [...gastos].reverse();

  return (
    <View style={styles.container}>
      <View style={styles.resumenHoy}>
        <Text style={styles.resumenTotal}>Gastado hoy: {formatPrecio(totalHoy.total)}</Text>
        <Text style={styles.resumenDesglose}>
          Efectivo {formatPrecio(totalHoy.porMetodoPago.efectivo)} · Transferencia{' '}
          {formatPrecio(totalHoy.porMetodoPago.transferencia)}
        </Text>
      </View>

      <FlatList
        data={gastosRecientesPrimero}
        keyExtractor={(item) => item.id}
        style={styles.lista}
        contentContainerStyle={styles.listaContenido}
        ListHeaderComponent={<GastoForm onGuardar={handleGuardarGasto} />}
        renderItem={({ item }) => (
          <Card style={styles.gasto}>
            <View style={styles.gastoRow}>
              <View style={styles.gastoInfo}>
                <Text style={styles.gastoDescripcion}>{item.descripcion}</Text>
                <Text style={styles.gastoDetalle}>
                  {CATEGORIA_GASTO_LABEL[item.categoria]} · {METODO_PAGO_LABEL[item.metodoPago]} ·{' '}
                  {formatHora(item.fechaHora)}
                </Text>
              </View>
              <Text style={styles.gastoMonto}>{formatPrecio(item.monto)}</Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.vacio}>Aún no hay gastos registrados hoy.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: spacing.xxl,
  },
  resumenHoy: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm + spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  resumenTotal: {
    ...typography.cardText,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  resumenDesglose: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  lista: {
    flex: 1,
  },
  listaContenido: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  gasto: {
    marginTop: spacing.sm,
  },
  gastoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gastoInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  gastoDescripcion: {
    ...typography.cardText,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  gastoDetalle: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  gastoMonto: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
  },
  vacio: {
    ...typography.cardText,
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
});
