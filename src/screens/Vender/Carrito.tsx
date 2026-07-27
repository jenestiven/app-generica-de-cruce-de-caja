import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatPrecio } from '../Menu/formatPrecio';
import type { CarritoItem } from './carritoUtils';

type CarritoProps = {
  items: CarritoItem[];
  total: number;
  onCambiarCantidad: (productoId: string, cantidad: number) => void;
  onQuitarProducto: (productoId: string) => void;
  onRegistrarVenta: () => void;
};

export default function Carrito({
  items,
  total,
  onCambiarCantidad,
  onQuitarProducto,
  onRegistrarVenta,
}: CarritoProps) {
  const vacio = items.length === 0;

  return (
    <View style={styles.container}>
      {!vacio && (
        <View style={styles.items}>
          {items.map((item) => (
            <View key={item.producto.id} style={styles.item}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemNombre}>{item.producto.nombre}</Text>
                <Text style={styles.itemSubtotal}>
                  {formatPrecio(item.producto.precio * item.cantidad)}
                </Text>
              </View>
              <View style={styles.itemControles}>
                <Pressable
                  style={styles.cantidadBoton}
                  onPress={() => onCambiarCantidad(item.producto.id, item.cantidad - 1)}
                >
                  <Text style={styles.cantidadBotonTexto}>−</Text>
                </Pressable>
                <Text style={styles.cantidad}>{item.cantidad}</Text>
                <Pressable
                  style={styles.cantidadBoton}
                  onPress={() => onCambiarCantidad(item.producto.id, item.cantidad + 1)}
                >
                  <Text style={styles.cantidadBotonTexto}>+</Text>
                </Pressable>
                <Pressable
                  style={styles.quitarBoton}
                  onPress={() => onQuitarProducto(item.producto.id)}
                >
                  <Text style={styles.quitarBotonTexto}>Quitar</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.total}>Total: {formatPrecio(total)}</Text>
        <Pressable
          style={[styles.registrarBoton, vacio && styles.registrarBotonDeshabilitado]}
          onPress={onRegistrarVenta}
          disabled={vacio}
        >
          <Text style={styles.registrarBotonTexto}>Registrar venta</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  items: {
    maxHeight: 220,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  item: {
    marginBottom: 10,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  itemSubtotal: {
    fontSize: 15,
    color: '#111',
  },
  itemControles: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 10,
  },
  cantidadBoton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cantidadBotonTexto: {
    fontSize: 16,
    color: '#333',
    lineHeight: 18,
  },
  cantidad: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  quitarBoton: {
    marginLeft: 'auto',
  },
  quitarBotonTexto: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  total: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
  },
  registrarBoton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  registrarBotonDeshabilitado: {
    backgroundColor: '#93b4ee',
  },
  registrarBotonTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
