import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

import {
  getHistorialDiferenciasCaja,
  getProductosMasVendidos,
  getResumenMensual,
  getVentasDiariasDelMes,
  type DiferenciaCajaDia,
  type ProductoMasVendido,
  type ResumenMensual,
  type VentaDiaria,
} from '../../db/analisis';
import { formatPrecio } from '../Menu/formatPrecio';
import MesSelector from './MesSelector';

const TOP_PRODUCTOS_LIMITE = 5;

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(85, 85, 85, ${opacity})`,
  propsForBackgroundLines: {
    stroke: '#f2f2f2',
  },
};

interface DatosMes {
  resumen: ResumenMensual;
  ventasDiarias: VentaDiaria[];
  productos: ProductoMasVendido[];
  diferencias: DiferenciaCajaDia[];
}

function cargarDatosMes(mes: number, anio: number): DatosMes {
  return {
    resumen: getResumenMensual(mes, anio),
    ventasDiarias: getVentasDiariasDelMes(mes, anio),
    productos: getProductosMasVendidos(mes, anio, TOP_PRODUCTOS_LIMITE),
    diferencias: getHistorialDiferenciasCaja(mes, anio),
  };
}

// "YYYY-MM-DD" -> "DD/MM", para las listas de la vista mensual.
function formatFechaCorta(fecha: string): string {
  const [, mesStr, diaStr] = fecha.split('-');
  return `${diaStr}/${mesStr}`;
}

function getDiaDelMes(fecha: string): number {
  const [, , diaStr] = fecha.split('-');
  return parseInt(diaStr, 10);
}

export default function MensualView() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [datos, setDatos] = useState<DatosMes>(() => cargarDatosMes(mes, anio));
  const [anchoGrafica, setAnchoGrafica] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setDatos(cargarDatosMes(mes, anio));
    }, [mes, anio])
  );

  function handleCambiarMes(mesNuevo: number, anioNuevo: number) {
    setMes(mesNuevo);
    setAnio(anioNuevo);
    setDatos(cargarDatosMes(mesNuevo, anioNuevo));
  }

  const { resumen, ventasDiarias, productos, diferencias } = datos;
  const sinDatos = resumen.diasOperados === 0;

  const datosGrafica = {
    labels: ventasDiarias.map((venta) => String(getDiaDelMes(venta.fecha))),
    datasets: [{ data: ventasDiarias.map((venta) => venta.totalVentas) }],
  };

  function handleLayoutGrafica(evento: LayoutChangeEvent) {
    setAnchoGrafica(evento.nativeEvent.layout.width);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <MesSelector mes={mes} anio={anio} onCambiar={handleCambiarMes} />

      {sinDatos ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>
            Este mes todavía no tiene ningún día cerrado. Cuando cierres caja al menos un día,
            aquí verás el resumen del mes.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.tarjetasFila}>
            <View style={styles.tarjeta}>
              <Text style={styles.tarjetaLabel}>Total ventas</Text>
              <Text style={styles.tarjetaValor}>{formatPrecio(resumen.totalVentas)}</Text>
            </View>
            <View style={styles.tarjeta}>
              <Text style={styles.tarjetaLabel}>Total gastos</Text>
              <Text style={styles.tarjetaValor}>{formatPrecio(resumen.totalGastos)}</Text>
            </View>
          </View>
          <View style={styles.tarjetasFila}>
            <View style={styles.tarjeta}>
              <Text style={styles.tarjetaLabel}>Utilidad neta</Text>
              <Text style={styles.tarjetaValor}>{formatPrecio(resumen.utilidadNeta)}</Text>
            </View>
            <View style={styles.tarjeta}>
              <Text style={styles.tarjetaLabel}>Promedio venta diaria</Text>
              <Text style={styles.tarjetaValor}>{formatPrecio(resumen.promedioVentaDiaria)}</Text>
            </View>
          </View>

          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Ventas por día</Text>
            <View style={styles.grafica} onLayout={handleLayoutGrafica}>
              {anchoGrafica > 0 && (
                <BarChart
                  data={datosGrafica}
                  width={anchoGrafica}
                  height={200}
                  fromZero
                  withInnerLines={false}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={chartConfig}
                  style={styles.graficaEstilo}
                />
              )}
            </View>
          </View>

          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Top {TOP_PRODUCTOS_LIMITE} productos</Text>
            {productos.length === 0 ? (
              <Text style={styles.vacioListaTexto}>No hay productos vendidos este mes.</Text>
            ) : (
              productos.map((producto, index) => (
                <View key={producto.productoId} style={styles.filaProducto}>
                  <Text style={styles.filaProductoPosicion}>{index + 1}</Text>
                  <Text style={styles.filaProductoNombre} numberOfLines={1}>
                    {producto.nombre}
                  </Text>
                  <Text style={styles.filaProductoCantidad}>{producto.cantidadVendida}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Diferencias de caja del mes</Text>
            {diferencias.length === 0 ? (
              <Text style={styles.vacioListaTexto}>No hay cierres registrados este mes.</Text>
            ) : (
              diferencias.map((dia) => {
                const cuadra = dia.diferencia === 0;
                return (
                  <View key={dia.fecha} style={styles.filaDiferencia}>
                    <Text style={styles.filaDiferenciaFecha}>{formatFechaCorta(dia.fecha)}</Text>
                    <Text
                      style={[
                        styles.filaDiferenciaValor,
                        cuadra
                          ? styles.textoNeutro
                          : dia.diferencia > 0
                            ? styles.textoVerde
                            : styles.textoRojo,
                      ]}
                    >
                      {cuadra
                        ? 'Cuadró'
                        : dia.diferencia > 0
                          ? `Sobró ${formatPrecio(dia.diferencia)}`
                          : `Faltó ${formatPrecio(Math.abs(dia.diferencia))}`}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </>
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
    paddingBottom: 32,
  },
  vacio: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  vacioTexto: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
  },
  tarjetasFila: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  tarjeta: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tarjetaLabel: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  tarjetaValor: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginTop: 4,
    textAlign: 'center',
  },
  seccion: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 14,
    marginTop: 6,
    marginBottom: 10,
  },
  seccionTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  grafica: {
    height: 200,
  },
  graficaEstilo: {
    borderRadius: 8,
  },
  vacioListaTexto: {
    fontSize: 13,
    color: '#777',
  },
  filaProducto: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  filaProductoPosicion: {
    width: 22,
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  filaProductoNombre: {
    flex: 1,
    fontSize: 14,
    color: '#111',
    marginRight: 8,
  },
  filaProductoCantidad: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  filaDiferencia: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  filaDiferenciaFecha: {
    fontSize: 14,
    color: '#555',
  },
  filaDiferenciaValor: {
    fontSize: 14,
    fontWeight: '600',
  },
  textoNeutro: {
    color: '#555',
  },
  textoVerde: {
    color: '#16a34a',
  },
  textoRojo: {
    color: '#dc2626',
  },
});
