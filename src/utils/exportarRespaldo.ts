import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import * as XLSX from 'xlsx';

import { setFechaUltimoRespaldo } from '../db/config';
import { getTodosLosCierres } from '../db/cierresCaja';
import { getTodosLosGastos } from '../db/gastos';
import { getProductos } from '../db/productos';
import { getTodasLasVentas, getTodosLosVentaItems } from '../db/ventas';

function nombreArchivoRespaldo(): string {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, '0');
  const day = String(ahora.getDate()).padStart(2, '0');
  const hours = String(ahora.getHours()).padStart(2, '0');
  const minutes = String(ahora.getMinutes()).padStart(2, '0');
  return `respaldo_${year}${month}${day}_${hours}${minutes}.xlsx`;
}

function armarLibroExcel(): XLSX.WorkBook {
  const libro = XLSX.utils.book_new();

  const hojas: Array<[string, object[]]> = [
    ['Productos', getProductos()],
    ['Ventas', getTodasLasVentas()],
    ['VentaItems', getTodosLosVentaItems()],
    ['Gastos', getTodosLosGastos()],
    ['CierresCaja', getTodosLosCierres()],
  ];

  for (const [nombreHoja, datos] of hojas) {
    const hoja = XLSX.utils.json_to_sheet(datos);
    XLSX.utils.book_append_sheet(libro, hoja, nombreHoja);
  }

  return libro;
}

/**
 * Exporta todo el historial (productos, ventas, venta_items, gastos y
 * cierres_caja) a un .xlsx en el cache del dispositivo y abre el selector
 * nativo para compartirlo. Reemplaza al backend en la nube por ahora — ver
 * docs/architecture.md.
 */
export async function generarYCompartirRespaldo(): Promise<void> {
  try {
    const disponible = await Sharing.isAvailableAsync();
    if (!disponible) {
      Alert.alert(
        'No se puede compartir',
        'Este dispositivo no tiene disponible la opción de compartir archivos.'
      );
      return;
    }

    const libro = armarLibroExcel();
    const contenidoBase64 = XLSX.write(libro, { type: 'base64', bookType: 'xlsx' });

    const archivo = new File(Paths.cache, nombreArchivoRespaldo());
    archivo.write(contenidoBase64, { encoding: 'base64' });

    await Sharing.shareAsync(archivo.uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Compartir respaldo',
      UTI: 'com.microsoft.excel.xlsx',
    });

    setFechaUltimoRespaldo(new Date());
  } catch (error) {
    console.error('Error al generar el respaldo:', error);
    Alert.alert(
      'Error al exportar el respaldo',
      'No se pudo generar o compartir el archivo. Intenta de nuevo en unos minutos.'
    );
  }
}
