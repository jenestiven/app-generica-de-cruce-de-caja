import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  Modal,
  Pressable,
  SectionList,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ProductoImagen from '../../components/ui/ProductoImagen';
import { actualizarProducto, crearProducto, getProductos } from '../../db/productos';
import { resetearBaseDeDatos } from '../../db/setup';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
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

  function handleReiniciarDatos() {
    Alert.alert(
      'Reiniciar datos de prueba',
      'Esto borrará todos los productos, ventas, gastos y cierres de caja guardados. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: () => {
            resetearBaseDeDatos();
            cargarProductos();
          },
        },
      ],
      { cancelable: true }
    );
  }

  const secciones = agruparPorCategoria(productos);

  return (
    <View style={styles.container}>
      <SectionList
        sections={secciones}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listaContenido}
        ListHeaderComponent={
          __DEV__ ? (
            <View style={styles.devContainer}>
              <Button variant="secondary" onPress={handleReiniciarDatos}>
                Reiniciar datos de prueba
              </Button>
            </View>
          ) : undefined
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.seccionTitulo}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <Pressable onPress={() => handleEditarProducto(item)}>
            <Card style={[styles.item, !item.activo && styles.itemInactivo]}>
              <View style={styles.itemRow}>
                <ProductoImagen
                  imagenUri={item.imagenUri}
                  categoria={item.categoria}
                  style={styles.itemImagen}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNombre}>{item.nombre}</Text>
                  <Text style={styles.itemPrecio}>{formatPrecio(item.precio)}</Text>
                </View>
                <Switch
                  value={item.activo}
                  onValueChange={() => handleToggleActivo(item)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.vacio}>Aún no hay productos. Agrega el primero.</Text>
        }
      />

      <View style={styles.fabContainer} pointerEvents="box-none">
        <Button onPress={handleAgregarProducto}>+ Agregar</Button>
      </View>

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
    backgroundColor: colors.background,
    marginTop: spacing.xxl,
  },
  listaContenido: {
    padding: spacing.lg,
    paddingBottom: 96,
  },
  devContainer: {
    marginBottom: spacing.md,
  },
  seccionTitulo: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  item: {
    marginBottom: spacing.sm,
  },
  itemInactivo: {
    opacity: 0.45,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImagen: {
    marginRight: spacing.md,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  itemNombre: {
    ...typography.cardText,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemPrecio: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  vacio: {
    ...typography.cardText,
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 40,
  },
  fabContainer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
  },
  modalFondo: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContenido: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
