import { Image, StyleSheet, Text, View, type StyleProp, type ImageStyle } from 'react-native';

import type { CategoriaProducto } from '../../types/producto';
import { CATEGORIA_ICONO } from '../../screens/Menu/categorias';

type ProductoImagenProps = {
  imagenUri: string | null;
  categoria: CategoriaProducto;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export default function ProductoImagen({
  imagenUri,
  categoria,
  size = 56,
  style,
}: ProductoImagenProps) {
  const dimensiones = { width: size, height: size, borderRadius: size / 6 };

  if (imagenUri !== null) {
    return (
      <Image
        source={{ uri: imagenUri }}
        style={[styles.imagen, dimensiones, style]}
      />
    );
  }

  return (
    <View style={[styles.placeholder, dimensiones, style]}>
      <Text style={[styles.icono, { fontSize: size * 0.5 }]}>{CATEGORIA_ICONO[categoria]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  imagen: {
    backgroundColor: '#f1f1f1',
  },
  placeholder: {
    backgroundColor: '#f1f1f1',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icono: {
    textAlign: 'center',
  },
});
