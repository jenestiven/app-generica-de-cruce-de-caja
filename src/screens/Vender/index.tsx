import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import ProductoImagen from '../../components/ui/ProductoImagen';
import { getCajaDeHoy } from '../../db/cierresCaja';
import { getProductos } from '../../db/productos';
import { crearVenta, getTotalVendidoHoy } from '../../db/ventas';
import type { CierreCaja } from '../../types/caja';
import type { Producto } from '../../types/producto';
import type { MetodoPago, TotalVendidoHoy } from '../../types/venta';
import AbrirCaja from '../Caja/AbrirCaja';
import ResumenCierre from '../Caja/ResumenCierre';
import { CATEGORIA_LABEL, CATEGORIA_ORDEN } from '../Menu/categorias';
import { formatPrecio } from '../Menu/formatPrecio';
import Carrito from './Carrito';
import {
  agregarProducto,
  calcularTotal,
  cambiarCantidad,
  quitarProducto,
  type CarritoItem,
} from './carritoUtils';
import SeleccionarMetodoPago from './SeleccionarMetodoPago';

type Seccion = {
  title: string;
  data: Producto[];
};

function agruparPorCategoria(productos: Producto[]): Seccion[] {
  return CATEGORIA_ORDEN.map((categoria) => ({
    title: CATEGORIA_LABEL[categoria],
    data: productos.filter((producto) => producto.categoria === categoria),
  })).filter((seccion) => seccion.data.length > 0);
}

export default function VenderScreen() {
  const [caja, setCaja] = useState<CierreCaja | null>(() => getCajaDeHoy());
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [totalHoy, setTotalHoy] = useState<TotalVendidoHoy>(() => getTotalVendidoHoy());
  const [modalMetodoPagoVisible, setModalMetodoPagoVisible] = useState(false);

  const cargarDatos = useCallback(() => {
    setProductos(getProductos().filter((producto) => producto.activo));
    setTotalHoy(getTotalVendidoHoy());
  }, []);

  useFocusEffect(
    useCallback(() => {
      setCaja(getCajaDeHoy());
      cargarDatos();
    }, [cargarDatos])
  );

  function handleAgregarProducto(producto: Producto) {
    setCarrito((actual) => agregarProducto(actual, producto));
  }

  function handleCambiarCantidad(productoId: string, cantidad: number) {
    setCarrito((actual) => cambiarCantidad(actual, productoId, cantidad));
  }

  function handleQuitarProducto(productoId: string) {
    setCarrito((actual) => quitarProducto(actual, productoId));
  }

  function handleAbrirSeleccionMetodoPago() {
    if (carrito.length === 0) {
      return;
    }
    setModalMetodoPagoVisible(true);
  }

  function handleConfirmarVenta(metodoPago: MetodoPago) {
    crearVenta(
      carrito.map((item) => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precio,
      })),
      metodoPago
    );
    setCarrito([]);
    setModalMetodoPagoVisible(false);
    setTotalHoy(getTotalVendidoHoy());
  }

  function handleCajaAbierta(cierre: CierreCaja) {
    setCaja(cierre);
    cargarDatos();
  }

  if (caja === null) {
    return <AbrirCaja onCajaAbierta={handleCajaAbierta} />;
  }

  if (caja.cerrado) {
    return <ResumenCierre cierre={caja} nota="La caja de hoy ya está cerrada. No se pueden registrar más ventas." />;
  }

  const secciones = agruparPorCategoria(productos);
  const totalCarrito = calcularTotal(carrito);

  return (
    <View style={styles.container}>
      <View style={styles.resumenHoy}>
        <Text style={styles.resumenTotal}>Hoy: {formatPrecio(totalHoy.total)}</Text>
        <Text style={styles.resumenDesglose}>
          Efectivo {formatPrecio(totalHoy.porMetodoPago.efectivo)} · Transferencia{' '}
          {formatPrecio(totalHoy.porMetodoPago.transferencia)}
          {totalHoy.porMetodoPago.tarjeta > 0
            ? ` · Tarjeta ${formatPrecio(totalHoy.porMetodoPago.tarjeta)}`
            : ''}
        </Text>
      </View>

      <SectionList
        sections={secciones}
        keyExtractor={(item) => item.id}
        style={styles.lista}
        contentContainerStyle={styles.listaContenido}
        renderSectionHeader={({ section }) => (
          <Text style={styles.seccionTitulo}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <Pressable style={styles.producto} onPress={() => handleAgregarProducto(item)}>
            <ProductoImagen
              imagenUri={item.imagenUri}
              categoria={item.categoria}
              style={styles.productoImagen}
            />
            <Text style={styles.productoNombre} numberOfLines={1}>
              {item.nombre}
            </Text>
            <Text style={styles.productoPrecio}>{formatPrecio(item.precio)}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.vacio}>No hay productos activos en el menú.</Text>
        }
      />

      <Carrito
        items={carrito}
        total={totalCarrito}
        onCambiarCantidad={handleCambiarCantidad}
        onQuitarProducto={handleQuitarProducto}
        onRegistrarVenta={handleAbrirSeleccionMetodoPago}
      />

      <SeleccionarMetodoPago
        visible={modalMetodoPagoVisible}
        total={totalCarrito}
        onConfirmar={handleConfirmarVenta}
        onCancelar={() => setModalMetodoPagoVisible(false)}
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
    padding: 16,
    paddingBottom: 24,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  producto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  productoImagen: {
    marginRight: 12,
  },
  productoNombre: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginRight: 12,
  },
  productoPrecio: {
    fontSize: 14,
    color: '#555',
  },
  vacio: {
    textAlign: 'center',
    color: '#777',
    marginTop: 40,
  },
});
