import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { getCajaDeHoy } from '../../db/cierresCaja';
import { crearGasto, getGastosDeHoy, getTotalGastadoHoy } from '../../db/gastos';
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
          <View style={styles.gasto}>
            <View style={styles.gastoInfo}>
              <Text style={styles.gastoDescripcion}>{item.descripcion}</Text>
              <Text style={styles.gastoDetalle}>
                {CATEGORIA_GASTO_LABEL[item.categoria]} · {METODO_PAGO_LABEL[item.metodoPago]} ·{' '}
                {formatHora(item.fechaHora)}
              </Text>
            </View>
            <Text style={styles.gastoMonto}>{formatPrecio(item.monto)}</Text>
          </View>
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
  },
  resumenHoy: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  resumenTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  resumenDesglose: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  lista: {
    flex: 1,
  },
  listaContenido: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  gasto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  gastoInfo: {
    flex: 1,
    marginRight: 12,
  },
  gastoDescripcion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  gastoDetalle: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  gastoMonto: {
    fontSize: 15,
    fontWeight: '700',
    color: '#dc2626',
  },
  vacio: {
    textAlign: 'center',
    color: '#777',
    marginTop: 24,
  },
});
