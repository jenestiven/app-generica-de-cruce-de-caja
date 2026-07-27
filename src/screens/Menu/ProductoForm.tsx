import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { CategoriaProducto, Producto } from '../../types/producto';
import { CATEGORIA_LABEL, CATEGORIA_ORDEN } from './categorias';

export type ProductoFormData = {
  nombre: string;
  categoria: CategoriaProducto;
  precio: number;
  activo: boolean;
};

type ProductoFormProps = {
  producto?: Producto;
  onSubmit: (data: ProductoFormData) => void;
  onCancel: () => void;
};

export default function ProductoForm({ producto, onSubmit, onCancel }: ProductoFormProps) {
  const esEdicion = producto !== undefined;

  const [nombre, setNombre] = useState(producto?.nombre ?? '');
  const [categoria, setCategoria] = useState<CategoriaProducto>(
    producto?.categoria ?? 'plato_fuerte'
  );
  const [precioTexto, setPrecioTexto] = useState(
    producto !== undefined ? String(producto.precio) : ''
  );
  const [activo, setActivo] = useState(producto?.activo ?? true);
  const [errorNombre, setErrorNombre] = useState<string | null>(null);
  const [errorPrecio, setErrorPrecio] = useState<string | null>(null);

  function handleSubmit() {
    const nombreLimpio = nombre.trim();
    const precio = Number(precioTexto.replace(',', '.'));

    const nuevoErrorNombre = nombreLimpio.length === 0 ? 'El nombre es requerido' : null;
    const nuevoErrorPrecio =
      !Number.isFinite(precio) || precio <= 0 ? 'El precio debe ser mayor a 0' : null;

    setErrorNombre(nuevoErrorNombre);
    setErrorPrecio(nuevoErrorPrecio);

    if (nuevoErrorNombre !== null || nuevoErrorPrecio !== null) {
      return;
    }

    onSubmit({ nombre: nombreLimpio, categoria, precio, activo });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{esEdicion ? 'Editar producto' : 'Agregar producto'}</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ej. Hamburguesa"
        autoCapitalize="sentences"
      />
      {errorNombre !== null && <Text style={styles.error}>{errorNombre}</Text>}

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.categoriaRow}>
        {CATEGORIA_ORDEN.map((opcion) => (
          <Pressable
            key={opcion}
            onPress={() => setCategoria(opcion)}
            style={[
              styles.categoriaChip,
              categoria === opcion && styles.categoriaChipSeleccionada,
            ]}
          >
            <Text
              style={[
                styles.categoriaChipTexto,
                categoria === opcion && styles.categoriaChipTextoSeleccionada,
              ]}
            >
              {CATEGORIA_LABEL[opcion]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Precio</Text>
      <TextInput
        style={styles.input}
        value={precioTexto}
        onChangeText={setPrecioTexto}
        placeholder="Ej. 15000"
        keyboardType="numeric"
      />
      {errorPrecio !== null && <Text style={styles.error}>{errorPrecio}</Text>}

      {esEdicion && (
        <View style={styles.activoRow}>
          <Text style={styles.label}>Producto activo</Text>
          <Switch value={activo} onValueChange={setActivo} />
        </View>
      )}

      <View style={styles.acciones}>
        <Pressable style={[styles.boton, styles.botonCancelar]} onPress={onCancel}>
          <Text style={styles.botonCancelarTexto}>Cancelar</Text>
        </Pressable>
        <Pressable style={[styles.boton, styles.botonGuardar]} onPress={handleSubmit}>
          <Text style={styles.botonGuardarTexto}>Guardar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  categoriaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoriaChip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoriaChipSeleccionada: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoriaChipTexto: {
    fontSize: 14,
    color: '#333',
  },
  categoriaChipTextoSeleccionada: {
    color: '#fff',
    fontWeight: '600',
  },
  error: {
    color: '#dc2626',
    marginTop: 6,
  },
  activoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  acciones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  boton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  botonCancelar: {
    backgroundColor: '#f1f1f1',
  },
  botonCancelarTexto: {
    color: '#333',
    fontWeight: '500',
  },
  botonGuardar: {
    backgroundColor: '#2563eb',
  },
  botonGuardarTexto: {
    color: '#fff',
    fontWeight: '600',
  },
});
