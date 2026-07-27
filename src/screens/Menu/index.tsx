import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Modal,
  Pressable,
  SectionList,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { actualizarProducto, crearProducto, getProductos } from '../../db/productos';
import type { Producto } from '../../types/producto';
import { CATEGORIA_LABEL, CATEGORIA_ORDEN } from './categorias';
import { formatPrecio } from './formatPrecio';
import ProductoForm, { type ProductoFormData } from './ProductoForm';

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

export default function MenuScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);

  const cargarProductos = useCallback(() => {
    setProductos(getProductos());
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarProductos();
    }, [cargarProductos])
  );

  function handleToggleActivo(producto: Producto) {
    actualizarProducto(producto.id, { activo: !producto.activo });
    cargarProductos();
  }

  function handleAgregarProducto() {
    setProductoEditando(null);
    setModalVisible(true);
  }

  function handleEditarProducto(producto: Producto) {
    setProductoEditando(producto);
    setModalVisible(true);
  }

  function handleCerrarModal() {
    setModalVisible(false);
    setProductoEditando(null);
  }

  function handleGuardarProducto(data: ProductoFormData) {
    if (productoEditando !== null) {
      actualizarProducto(productoEditando.id, data);
    } else {
      crearProducto(data);
    }
    handleCerrarModal();
    cargarProductos();
  }

  const secciones = agruparPorCategoria(productos);

  return (
    <View style={styles.container}>
      <SectionList
        sections={secciones}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listaContenido}
        renderSectionHeader={({ section }) => (
          <Text style={styles.seccionTitulo}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.item, !item.activo && styles.itemInactivo]}
            onPress={() => handleEditarProducto(item)}
          >
            <View style={styles.itemInfo}>
              <Text style={styles.itemNombre}>{item.nombre}</Text>
              <Text style={styles.itemPrecio}>{formatPrecio(item.precio)}</Text>
            </View>
            <Switch value={item.activo} onValueChange={() => handleToggleActivo(item)} />
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.vacio}>Aún no hay productos. Agrega el primero.</Text>
        }
      />

      <Pressable style={styles.fab} onPress={handleAgregarProducto}>
        <Text style={styles.fabTexto}>+</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={handleCerrarModal}>
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <ProductoForm
              key={productoEditando?.id ?? 'nuevo'}
              producto={productoEditando ?? undefined}
              onSubmit={handleGuardarProducto}
              onCancel={handleCerrarModal}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listaContenido: {
    padding: 16,
    paddingBottom: 96,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  item: {
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
  itemInactivo: {
    opacity: 0.45,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  itemPrecio: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  vacio: {
    textAlign: 'center',
    color: '#777',
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabTexto: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 30,
  },
  modalFondo: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContenido: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
