import { ScrollView, StyleSheet, Text, View } from 'react-native';

import StatusBadge from '../../components/ui/StatusBadge';
import SummaryRow from '../../components/ui/SummaryRow';
import { getTotalGastadoHoy } from '../../db/gastos';
import { getTotalVendidoHoy } from '../../db/ventas';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { CierreCaja } from '../../types/caja';
import { formatPrecio } from '../Menu/formatPrecio';
import { METODO_PAGO_LABEL } from '../Vender/metodoPago';

type ResumenCierreProps = {
  cierre: CierreCaja;
  nota?: string;
};

// Resumen final, no editable, del cierre de un día ya cerrado.
// Se usa tanto en la pestaña Caja como en el bloqueo de Vender/Gastos.
export default function ResumenCierre({ cierre, nota }: ResumenCierreProps) {
  const ventas = getTotalVendidoHoy();
  const gastos = getTotalGastadoHoy();
  const diferencia = cierre.diferencia ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <Text style={styles.titulo}>Caja cerrada</Text>
      {nota !== undefined && <Text style={styles.nota}>{nota}</Text>}

      <SummaryRow label="Base inicial" value={formatPrecio(cierre.baseInicial)} />

      <View style={styles.seccion}>
        <SummaryRow label="Total ventas" value={formatPrecio(cierre.totalVentas)} />
        <SummaryRow
          label={METODO_PAGO_LABEL.efectivo}
          value={formatPrecio(ventas.porMetodoPago.efectivo)}
        />
        <SummaryRow
          label={METODO_PAGO_LABEL.transferencia}
          value={formatPrecio(ventas.porMetodoPago.transferencia)}
        />
        {ventas.porMetodoPago.tarjeta > 0 && (
          <SummaryRow
            label={METODO_PAGO_LABEL.tarjeta}
            value={formatPrecio(ventas.porMetodoPago.tarjeta)}
          />
        )}
      </View>

      <View style={styles.seccion}>
        <SummaryRow label="Total gastos" value={formatPrecio(cierre.totalGastos)} />
        <SummaryRow
          label={METODO_PAGO_LABEL.efectivo}
          value={formatPrecio(gastos.porMetodoPago.efectivo)}
        />
        <SummaryRow
          label={METODO_PAGO_LABEL.transferencia}
          value={formatPrecio(gastos.porMetodoPago.transferencia)}
        />
        {gastos.porMetodoPago.tarjeta > 0 && (
          <SummaryRow
            label={METODO_PAGO_LABEL.tarjeta}
            value={formatPrecio(gastos.porMetodoPago.tarjeta)}
          />
        )}
      </View>

      <SummaryRow label="Efectivo esperado" value={formatPrecio(cierre.efectivoEsperado)} />
      <SummaryRow label="Efectivo contado" value={formatPrecio(cierre.efectivoContado ?? 0)} />

      <View style={styles.diferenciaFila}>
        <Text style={styles.diferenciaLabel}>Diferencia</Text>
        <StatusBadge value={formatPrecio(Math.abs(diferencia))} positive={diferencia >= 0} />
      </View>

      <SummaryRow
        label="Utilidad neta del día"
        value={formatPrecio(cierre.utilidadNeta ?? 0)}
        variant="total"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contenido: {
    padding: spacing.xl,
  },
  titulo: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  nota: {
    ...typography.cardText,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  seccion: {
    marginTop: spacing.lg,
  },
  diferenciaFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  diferenciaLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
