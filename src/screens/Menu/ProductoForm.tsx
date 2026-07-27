import { useState } from 'react';
import * as Crypto from 'expo-crypto';
import { Image, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import Button from '../../components/ui/Button';
import Chip from '../../components/ui/Chip';
import Input from '../../components/ui/Input';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
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

      <Input
        label="Nombre"
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ej. Hamburguesa"
        autoCapitalize="sentences"
        error={errorNombre ?? undefined}
      />

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.categoriaRow}>
        {CATEGORIA_ORDEN.map((opcion) => (
          <Chip
            key={opcion}
            label={CATEGORIA_LABEL[opcion]}
            selected={categoria === opcion}
            onPress={() => setCategoria(opcion)}
          />
        ))}
      </View>

      <Input
        label="Precio"
        value={precioTexto}
        onChangeText={setPrecioTexto}
        placeholder="Ej. 15000"
        keyboardType="numeric"
        error={errorPrecio ?? undefined}
      />

      {esEdicion && (
        <View style={styles.activoRow}>
          <Text style={styles.label}>Producto activo</Text>
          <Switch
            value={activo}
            onValueChange={setActivo}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      )}

      <View style={styles.acciones}>
        <Button variant="secondary" onPress={handleCancelar}>
          Cancelar
        </Button>
        <Button variant="primary" onPress={handleSubmit}>
          Guardar
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
  },
  titulo: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  imagenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniaturaPlaceholderIcono: {
    fontSize: 30,
  },
  imagenAcciones: {
    gap: spacing.sm,
  },
  imagenAccionTexto: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
  imagenAccionQuitarTexto: {
    fontSize: 14,
    color: colors.danger,
  },
  categoriaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  activoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  acciones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});
