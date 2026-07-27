import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getTotalGastadoHoy } from '../../db/gastos';
import { getTotalVendidoHoy } from '../../db/ventas';
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
  const cuadra = diferencia === 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <Text style={styles.titulo}>Caja cerrada</Text>
      {nota !== undefined && <Text style={styles.nota}>{nota}</Text>}

      <View style={styles.fila}>
        <Text style={styles.filaLabel}>Base inicial</Text>
        <Text style={styles.filaValor}>{formatPrecio(cierre.baseInicial)}</Text>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Ventas: {formatPrecio(cierre.totalVentas)}</Text>
        <View style={styles.fila}>
          <Text style={styles.filaLabel}>{METODO_PAGO_LABEL.efectivo}</Text>
          <Text style={styles.filaValor}>{formatPrecio(ventas.porMetodoPago.efectivo)}</Text>
        </View>
        <View style={styles.fila}>
          <Text style={styles.filaLabel}>{METODO_PAGO_LABEL.transferencia}</Text>
          <Text style={styles.filaValor}>{formatPrecio(ventas.porMetodoPago.transferencia)}</Text>
        </View>
        {ventas.porMetodoPago.tarjeta > 0 && (
          <View style={styles.fila}>
            <Text style={styles.filaLabel}>{METODO_PAGO_LABEL.tarjeta}</Text>
            <Text style={styles.filaValor}>{formatPrecio(ventas.porMetodoPago.tarjeta)}</Text>
          </View>
        )}
      </View>

      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Gastos: {formatPrecio(cierre.totalGastos)}</Text>
        <View style={styles.fila}>
          <Text style={styles.filaLabel}>{METODO_PAGO_LABEL.efectivo}</Text>
          <Text style={styles.filaValor}>{formatPrecio(gastos.porMetodoPago.efectivo)}</Text>
        </View>
        <View style={styles.fila}>
          <Text style={styles.filaLabel}>{METODO_PAGO_LABEL.transferencia}</Text>
          <Text style={styles.filaValor}>{formatPrecio(gastos.porMetodoPago.transferencia)}</Text>
        </View>
        {gastos.porMetodoPago.tarjeta > 0 && (
          <View style={styles.fila}>
            <Text style={styles.filaLabel}>{METODO_PAGO_LABEL.tarjeta}</Text>
            <Text style={styles.filaValor}>{formatPrecio(gastos.porMetodoPago.tarjeta)}</Text>
          </View>
        )}
      </View>

      <View style={styles.fila}>
        <Text style={styles.filaLabel}>Efectivo esperado</Text>
        <Text style={styles.filaValor}>{formatPrecio(cierre.efectivoEsperado)}</Text>
      </View>
      <View style={styles.fila}>
        <Text style={styles.filaLabel}>Efectivo contado</Text>
        <Text style={styles.filaValor}>{formatPrecio(cierre.efectivoContado ?? 0)}</Text>
      </View>

      <View style={styles.destacado}>
        <Text style={styles.destacadoLabel}>Diferencia</Text>
        <Text style={[styles.destacadoValor, cuadra ? styles.textoVerde : styles.textoRojo]}>
          {cuadra
            ? 'Cuadró exacto'
            : diferencia > 0
              ? `Sobró ${formatPrecio(diferencia)}`
              : `Faltó ${formatPrecio(Math.abs(diferencia))}`}
        </Text>
      </View>

      <View style={styles.destacado}>
        <Text style={styles.destacadoLabel}>Utilidad neta del día</Text>
        <Text style={styles.destacadoValor}>{formatPrecio(cierre.utilidadNeta ?? 0)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contenido: {
    padding: 24,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  nota: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 8,
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
  destacado: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  destacadoLabel: {
    fontSize: 14,
    color: '#555',
  },
  destacadoValor: {
    fontSize: 20,
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
