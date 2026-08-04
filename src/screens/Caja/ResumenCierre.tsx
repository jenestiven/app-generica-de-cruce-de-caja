import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
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
  onCorregir?: () => void;
};

function formatFechaHoraCorreccion(fechaHora: string): string {
  return new Date(fechaHora).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Resumen final, no editable, del cierre de un día ya cerrado.
// Se usa tanto en la pestaña Caja como en el bloqueo de Vender/Gastos.
export default function ResumenCierre({ cierre, nota, onCorregir }: ResumenCierreProps) {
  const ventas = getTotalVendidoHoy();
  const gastos = getTotalGastadoHoy();
  const diferencia = cierre.diferencia ?? 0;
  const [mostrarDetalleCorreccion, setMostrarDetalleCorreccion] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <Text style={styles.titulo}>Caja cerrada</Text>

      {cierre.corregido && (
        <View style={styles.correccionContainer}>
          <Pressable
            onPress={() => setMostrarDetalleCorreccion((valor) => !valor)}
            style={styles.correccionBadgeWrapper}
          >
            <Badge label="Corregido" />
          </Pressable>
          {mostrarDetalleCorreccion && (
            <View style={styles.correccionDetalle}>
              {cierre.fechaCorreccion !== null && (
                <Text style={styles.correccionDetalleTexto}>
                  Corregido el {formatFechaHoraCorreccion(cierre.fechaCorreccion)}
                </Text>
              )}
              {cierre.motivoCorreccion !== null && cierre.motivoCorreccion !== '' && (
                <Text style={styles.correccionDetalleTexto}>{cierre.motivoCorreccion}</Text>
              )}
            </View>
          )}
        </View>
      )}

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

      {onCorregir !== undefined && (
        <View style={styles.botonContainer}>
          <Button variant="secondary" onPress={onCorregir}>
            Corregir cierre de hoy
          </Button>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: spacing.xxl,
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
  correccionContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  correccionBadgeWrapper: {
    alignItems: 'center',
  },
  correccionDetalle: {
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  correccionDetalleTexto: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
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
  botonContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
});
