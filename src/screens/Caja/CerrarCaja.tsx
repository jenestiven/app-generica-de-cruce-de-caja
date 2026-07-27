import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { cerrarCaja, previsualizarCierre } from '../../db/cierresCaja';
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
        <Pressable style={styles.boton} onPress={handleIniciarCierre}>
          <Text style={styles.botonTexto}>Cerrar caja</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Resumen del cierre</Text>

      <View style={styles.fila}>
        <Text style={styles.filaLabel}>Base inicial</Text>
        <Text style={styles.filaValor}>{formatPrecio(preview.baseInicial)}</Text>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Ventas: {formatPrecio(preview.totalVentas)}</Text>
        <View style={styles.fila}>
          <Text style={styles.filaLabel}>{METODO_PAGO_LABEL.efectivo}</Text>
          <Text style={styles.filaValor}>
            {formatPrecio(preview.ventasPorMetodoPago.efectivo)}
          </Text>
        </View>
        <View style={styles.fila}>
          <Text style={styles.filaLabel}>{METODO_PAGO_LABEL.transferencia}</Text>
          <Text style={styles.filaValor}>
            {formatPrecio(preview.ventasPorMetodoPago.transferencia)}
          </Text>
        </View>
        {preview.ventasPorMetodoPago.tarjeta > 0 && (
          <View style={styles.fila}>
            <Text style={styles.filaLabel}>{METODO_PAGO_LABEL.tarjeta}</Text>
            <Text style={styles.filaValor}>
              {formatPrecio(preview.ventasPorMetodoPago.tarjeta)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Gastos: {formatPrecio(preview.totalGastos)}</Text>
        <View style={styles.fila}>
          <Text style={styles.filaLabel}>{METODO_PAGO_LABEL.efectivo}</Text>
          <Text style={styles.filaValor}>
            {formatPrecio(preview.gastosPorMetodoPago.efectivo)}
          </Text>
        </View>
        <View style={styles.fila}>
          <Text style={styles.filaLabel}>{METODO_PAGO_LABEL.transferencia}</Text>
          <Text style={styles.filaValor}>
            {formatPrecio(preview.gastosPorMetodoPago.transferencia)}
          </Text>
        </View>
        {preview.gastosPorMetodoPago.tarjeta > 0 && (
          <View style={styles.fila}>
            <Text style={styles.filaLabel}>{METODO_PAGO_LABEL.tarjeta}</Text>
            <Text style={styles.filaValor}>
              {formatPrecio(preview.gastosPorMetodoPago.tarjeta)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.filaDestacada}>
        <Text style={styles.filaDestacadaLabel}>Efectivo esperado</Text>
        <Text style={styles.filaDestacadaValor}>{formatPrecio(preview.efectivoEsperado)}</Text>
      </View>

      <Text style={styles.label}>¿Cuánto contaste en efectivo?</Text>
      <TextInput
        style={styles.input}
        value={efectivoContadoTexto}
        onChangeText={setEfectivoContadoTexto}
        placeholder="0"
        keyboardType="numeric"
      />
      {error !== null && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.boton} onPress={handleConfirmarCierre}>
        <Text style={styles.botonTexto}>Confirmar cierre</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
  },
  seccion: {
    marginTop: 16,
  },
  seccionTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  filaLabel: {
    fontSize: 14,
    color: '#555',
  },
  filaValor: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
  },
  filaDestacada: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  filaDestacadaLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  filaDestacadaValor: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginTop: 20,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    color: '#dc2626',
    marginTop: 6,
  },
  boton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
