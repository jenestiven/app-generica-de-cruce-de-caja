import { useState } from 'react';
import * as Crypto from 'expo-crypto';
import {
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { CategoriaProducto, Producto } from '../../types/producto';
import { eliminarImagenProducto, seleccionarYGuardarImagen } from '../../utils/imagenes';
import { CATEGORIA_ICONO, CATEGORIA_LABEL, CATEGORIA_ORDEN } from './categorias';

export type ProductoFormData = {
  nombre: string;
  categoria: CategoriaProducto;
  precio: number;
  activo: boolean;
  imagenUri: string | null;
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
  const [imagenUri, setImagenUri] = useState<string | null>(producto?.imagenUri ?? null);
  const [errorNombre, setErrorNombre] = useState<string | null>(null);
  const [errorPrecio, setErrorPrecio] = useState<string | null>(null);
  const [idParaImagen] = useState(() => producto?.id ?? Crypto.randomUUID());

  async function handleSeleccionarImagen() {
    const nuevaUri = await seleccionarYGuardarImagen(idParaImagen);
    if (nuevaUri !== null) {
      setImagenUri(nuevaUri);
    }
  }

  function handleQuitarImagen() {
    eliminarImagenProducto(idParaImagen);
    setImagenUri(null);
  }

  function handleCancelar() {
    if (!esEdicion && imagenUri !== null) {
      eliminarImagenProducto(idParaImagen);
    }
    onCancel();
  }

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

    onSubmit({ nombre: nombreLimpio, categoria, precio, activo, imagenUri });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{esEdicion ? 'Editar producto' : 'Agregar producto'}</Text>

      <View style={styles.imagenRow}>
        <Pressable style={styles.miniatura} onPress={handleSeleccionarImagen}>
          {imagenUri !== null ? (
            <Image source={{ uri: imagenUri }} style={styles.miniaturaImagen} />
          ) : (
            <View style={styles.miniaturaPlaceholder}>
              <Text style={styles.miniaturaPlaceholderIcono}>{CATEGORIA_ICONO[categoria]}</Text>
            </View>
          )}
        </Pressable>
        <View style={styles.imagenAcciones}>
          <Pressable onPress={handleSeleccionarImagen}>
            <Text style={styles.imagenAccionTexto}>
              {imagenUri !== null ? 'Cambiar foto' : 'Agregar foto'}
            </Text>
          </Pressable>
          {imagenUri !== null && (
            <Pressable onPress={handleQuitarImagen}>
              <Text style={styles.imagenAccionQuitarTexto}>Quitar foto</Text>
            </Pressable>
          )}
        </View>
      </View>

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
        <Pressable style={[styles.boton, styles.botonCancelar]} onPress={handleCancelar}>
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
  imagenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  miniatura: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
  },
  miniaturaImagen: {
    width: '100%',
    height: '100%',
  },
  miniaturaPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f1f1',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniaturaPlaceholderIcono: {
    fontSize: 30,
  },
  imagenAcciones: {
    gap: 6,
  },
  imagenAccionTexto: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  imagenAccionQuitarTexto: {
    fontSize: 14,
    color: '#dc2626',
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
