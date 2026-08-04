import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SummaryRow from '../../components/ui/SummaryRow';
import { cerrarCaja, previsualizarCierre } from '../../db/cierresCaja';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { CierreCaja, PreviewCierre } from '../../types/caja';
import { formatPrecio } from '../Menu/formatPrecio';
import { METODO_PAGO_LABEL } from '../Vender/metodoPago';

type CerrarCajaProps = {
  caja: CierreCaja;
  onCerrada: (cierre: CierreCaja) => void;
};

export default function CerrarCaja({ caja, onCerrada }: CerrarCajaProps) {
  const [preview, setPreview] = useState<PreviewCierre | null>(null);
  const [efectivoContadoTexto, setEfectivoContadoTexto] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleIniciarCierre() {
    setPreview(previsualizarCierre());
  }

  function handleConfirmarCierre() {
    const textoLimpio = efectivoContadoTexto.trim().replace(',', '.');
    const efectivoContado = textoLimpio.length === 0 ? NaN : Number(textoLimpio);

    if (!Number.isFinite(efectivoContado) || efectivoContado < 0) {
      setError('Ingresa un monto válido');
      return;
    }

    setError(null);
    const cierre = cerrarCaja(efectivoContado);
    onCerrada(cierre);
  }

  if (preview === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Caja abierta</Text>
        <Text style={styles.subtitulo}>
          Base inicial: {formatPrecio(caja.baseInicial)}
        </Text>
        <View style={styles.botonContainer}>
          <Button onPress={handleIniciarCierre}>Cerrar caja</Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <Text style={styles.titulo}>Resumen del cierre</Text>

      <SummaryRow label="Base inicial" value={formatPrecio(preview.baseInicial)} />

      <View style={styles.seccion}>
        <SummaryRow label="Total ventas" value={formatPrecio(preview.totalVentas)} />
        <SummaryRow
          label={METODO_PAGO_LABEL.efectivo}
          value={formatPrecio(preview.ventasPorMetodoPago.efectivo)}
        />
        <SummaryRow
          label={METODO_PAGO_LABEL.transferencia}
          value={formatPrecio(preview.ventasPorMetodoPago.transferencia)}
        />
        {preview.ventasPorMetodoPago.tarjeta > 0 && (
          <SummaryRow
            label={METODO_PAGO_LABEL.tarjeta}
            value={formatPrecio(preview.ventasPorMetodoPago.tarjeta)}
          />
        )}
      </View>

      <View style={styles.seccion}>
        <SummaryRow label="Total gastos" value={formatPrecio(preview.totalGastos)} />
        <SummaryRow
          label={METODO_PAGO_LABEL.efectivo}
          value={formatPrecio(preview.gastosPorMetodoPago.efectivo)}
        />
        <SummaryRow
          label={METODO_PAGO_LABEL.transferencia}
          value={formatPrecio(preview.gastosPorMetodoPago.transferencia)}
        />
        {preview.gastosPorMetodoPago.tarjeta > 0 && (
          <SummaryRow
            label={METODO_PAGO_LABEL.tarjeta}
            value={formatPrecio(preview.gastosPorMetodoPago.tarjeta)}
          />
        )}
      </View>

      <SummaryRow label="Efectivo esperado" value={formatPrecio(preview.efectivoEsperado)} />

      <View style={styles.inputContainer}>
        <Input
          label="¿Cuánto contaste en efectivo?"
          value={efectivoContadoTexto}
          onChangeText={setEfectivoContadoTexto}
          placeholder="0"
          keyboardType="numeric"
          error={error ?? undefined}
        />
      </View>

      <View style={styles.botonContainer}>
        <Button onPress={handleConfirmarCierre}>Confirmar cierre</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  contenido: {
    padding: spacing.xl,
  },
  titulo: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitulo: {
    ...typography.cardText,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  seccion: {
    marginTop: spacing.lg,
  },
  inputContainer: {
    marginTop: spacing.xl,
  },
  botonContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
});
