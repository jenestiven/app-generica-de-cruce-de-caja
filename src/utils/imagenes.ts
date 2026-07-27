import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';

const CARPETA_PRODUCTOS = 'productos';

type OrigenImagen = 'camara' | 'galeria';

function directorioProductos(): Directory {
  const directorio = new Directory(Paths.document, CARPETA_PRODUCTOS);
  directorio.create({ intermediates: true, idempotent: true });
  return directorio;
}

function archivoImagenProducto(productoId: string): File {
  return new File(Paths.document, CARPETA_PRODUCTOS, `${productoId}.jpg`);
}

function preguntarOrigenImagen(): Promise<OrigenImagen | null> {
  return new Promise((resolve) => {
    Alert.alert(
      'Foto del producto',
      '¿De dónde quieres obtener la imagen?',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
        { text: 'Cámara', onPress: () => resolve('camara') },
        { text: 'Galería', onPress: () => resolve('galeria') },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}

async function abrirSelectorImagen(origen: OrigenImagen): Promise<string | null> {
  const opciones: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  };

  if (origen === 'camara') {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso requerido', 'Necesitas dar permiso de cámara para tomar la foto.');
      return null;
    }
    const resultado = await ImagePicker.launchCameraAsync(opciones);
    return resultado.canceled ? null : resultado.assets[0].uri;
  }

  const resultado = await ImagePicker.launchImageLibraryAsync(opciones);
  return resultado.canceled ? null : resultado.assets[0].uri;
}

/**
 * Presenta al usuario la opción de tomar una foto o elegirla de la galería,
 * y guarda una copia estable en documentDirectory/productos/{productoId}.jpg.
 * Retorna la ruta local final para guardar como `imagenUri`, o null si el
 * usuario canceló en cualquier punto del flujo.
 */
export async function seleccionarYGuardarImagen(productoId: string): Promise<string | null> {
  const origen = await preguntarOrigenImagen();
  if (!origen) return null;

  const uriSeleccionada = await abrirSelectorImagen(origen);
  if (!uriSeleccionada) return null;

  directorioProductos();

  const archivoOrigen = new File(uriSeleccionada);
  const archivoDestino = archivoImagenProducto(productoId);
  archivoOrigen.copy(archivoDestino, { overwrite: true });

  return archivoDestino.uri;
}

/** Borra la imagen local del producto (si existe) al quitarle la foto. */
export function eliminarImagenProducto(productoId: string): void {
  const archivo = archivoImagenProducto(productoId);
  if (archivo.exists) {
    archivo.delete();
  }
}
