import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import SummaryRow from '../../components/ui/SummaryRow';
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
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatPrecio } from '../Menu/formatPrecio';
import MesSelector from './MesSelector';

const TOP_PRODUCTOS_LIMITE = 5;

const chartConfig = {
  backgroundGradientFrom: colors.background,
  backgroundGradientTo: colors.background,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 122, 26, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(118, 118, 118, ${opacity})`,
  propsForBackgroundLines: {
    stroke: colors.border,
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
            <Card style={styles.tarjeta}>
              <Text style={styles.tarjetaLabel}>Total ventas</Text>
              <Text style={styles.tarjetaValor} numberOfLines={1} adjustsFontSizeToFit>
                {formatPrecio(resumen.totalVentas)}
              </Text>
            </Card>
            <Card style={styles.tarjeta}>
              <Text style={styles.tarjetaLabel}>Total gastos</Text>
              <Text style={styles.tarjetaValor} numberOfLines={1} adjustsFontSizeToFit>
                {formatPrecio(resumen.totalGastos)}
              </Text>
            </Card>
          </View>
          <View style={styles.tarjetasFila}>
            <Card style={styles.tarjeta}>
              <Text style={styles.tarjetaLabel}>Utilidad neta</Text>
              <Text style={styles.tarjetaValor} numberOfLines={1} adjustsFontSizeToFit>
                {formatPrecio(resumen.utilidadNeta)}
              </Text>
            </Card>
            <Card style={styles.tarjeta}>
              <Text style={styles.tarjetaLabel}>Promedio venta diaria</Text>
              <Text style={styles.tarjetaValor} numberOfLines={1} adjustsFontSizeToFit>
                {formatPrecio(resumen.promedioVentaDiaria)}
              </Text>
            </Card>
          </View>

          <Card style={styles.seccion}>
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
          </Card>

          <Card style={styles.seccion}>
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
          </Card>

          <Card style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Diferencias de caja del mes</Text>
            {diferencias.length === 0 ? (
              <Text style={styles.vacioListaTexto}>No hay cierres registrados este mes.</Text>
            ) : (
              diferencias.map((dia) => {
                const cuadra = dia.diferencia === 0;
                return (
                  <SummaryRow
                    key={dia.fecha}
                    label={formatFechaCorta(dia.fecha)}
                    value={cuadra ? 'Cuadró' : undefined}
                    valueElement={
                      cuadra ? undefined : (
                        <StatusBadge
                          value={formatPrecio(Math.abs(dia.diferencia))}
                          positive={dia.diferencia > 0}
                        />
                      )
                    }
                  />
                );
              })
            )}
          </Card>
        </>
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
    paddingBottom: spacing.xxl,
  },
  vacio: {
    marginTop: spacing.xxl + spacing.sm,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  vacioTexto: {
    ...typography.cardText,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  tarjetasFila: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tarjeta: {
    flex: 1,
    alignItems: 'center',
  },
  tarjetaLabel: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tarjetaValor: {
    ...typography.numberLarge,
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  seccion: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  seccionTitulo: {
    ...typography.cardText,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  grafica: {
    height: 200,
  },
  graficaEstilo: {
    borderRadius: 8,
  },
  vacioListaTexto: {
    ...typography.label,
    color: colors.textSecondary,
  },
  filaProducto: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filaProductoPosicion: {
    width: 22,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  filaProductoNombre: {
    flex: 1,
    ...typography.cardText,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  filaProductoCantidad: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
