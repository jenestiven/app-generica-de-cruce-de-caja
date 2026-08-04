import * as SQLite from 'expo-sqlite';
import { Directory, Paths } from 'expo-file-system';

export const db = SQLite.openDatabaseSync('ventas-pulga.db');

const CARPETA_PRODUCTOS = 'productos';

// Orden que respeta las foreign keys: venta_items depende de ventas y productos.
const TABLAS_A_LIMPIAR = ['venta_items', 'ventas', 'productos', 'gastos', 'cierres_caja'];

export function initDatabase(): void {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS productos (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      categoria TEXT NOT NULL CHECK (categoria IN ('plato_fuerte', 'bebida', 'coctel', 'adicion')),
      precio REAL NOT NULL,
      activo INTEGER NOT NULL DEFAULT 1,
      imagen_uri TEXT,
      updated_at TEXT NOT NULL,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS cierres_caja (
      id TEXT PRIMARY KEY NOT NULL,
      fecha TEXT NOT NULL UNIQUE,
      base_inicial REAL NOT NULL,
      cerrado INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS ventas (
      id TEXT PRIMARY KEY NOT NULL,
      fecha_hora TEXT NOT NULL,
      total REAL NOT NULL,
      metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta')),
      updated_at TEXT NOT NULL,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS venta_items (
      id TEXT PRIMARY KEY NOT NULL,
      venta_id TEXT NOT NULL REFERENCES ventas(id),
      producto_id TEXT NOT NULL REFERENCES productos(id),
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      subtotal REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gastos (
      id TEXT PRIMARY KEY NOT NULL,
      fecha_hora TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      categoria TEXT NOT NULL CHECK (categoria IN ('insumos', 'domicilio', 'servicios', 'otro')),
      monto REAL NOT NULL,
      metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta')),
      updated_at TEXT NOT NULL,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  migrarColumnasCierresCaja();
  migrarColumnasProductos();
}

const COLUMNAS_ARQUEO_CIERRES_CAJA: Array<{ nombre: string; definicion: string }> = [
  { nombre: 'total_ventas', definicion: 'REAL NOT NULL DEFAULT 0' },
  { nombre: 'total_ventas_efectivo', definicion: 'REAL NOT NULL DEFAULT 0' },
  { nombre: 'total_gastos', definicion: 'REAL NOT NULL DEFAULT 0' },
  { nombre: 'total_gastos_efectivo', definicion: 'REAL NOT NULL DEFAULT 0' },
  { nombre: 'efectivo_esperado', definicion: 'REAL NOT NULL DEFAULT 0' },
  { nombre: 'efectivo_contado', definicion: 'REAL' },
  { nombre: 'diferencia', definicion: 'REAL' },
  { nombre: 'utilidad_neta', definicion: 'REAL' },
  { nombre: 'en_correccion', definicion: 'INTEGER NOT NULL DEFAULT 0' },
  { nombre: 'corregido', definicion: 'INTEGER NOT NULL DEFAULT 0' },
  { nombre: 'fecha_correccion', definicion: 'TEXT' },
  { nombre: 'motivo_correccion', definicion: 'TEXT' },
];

// SQLite no soporta "ADD COLUMN IF NOT EXISTS": hay que revisar las columnas
// existentes con PRAGMA table_info y solo agregar las que falten.
function migrarColumnasCierresCaja(): void {
  const columnasExistentes = new Set(
    db.getAllSync<{ name: string }>('PRAGMA table_info(cierres_caja)').map((columna) => columna.name)
  );

  for (const columna of COLUMNAS_ARQUEO_CIERRES_CAJA) {
    if (!columnasExistentes.has(columna.nombre)) {
      db.execSync(`ALTER TABLE cierres_caja ADD COLUMN ${columna.nombre} ${columna.definicion};`);
    }
  }
}

// productos viene de sprints anteriores sin imagen_uri: se agrega con ALTER TABLE
// para no perder los productos ya registrados.
function migrarColumnasProductos(): void {
  const columnasExistentes = new Set(
    db.getAllSync<{ name: string }>('PRAGMA table_info(productos)').map((columna) => columna.name)
  );

  if (!columnasExistentes.has('imagen_uri')) {
    db.execSync('ALTER TABLE productos ADD COLUMN imagen_uri TEXT;');
  }
}

/**
 * Borra todos los datos de prueba: vacía las tablas (DELETE, conserva el
 * esquema) y elimina las imágenes de productos guardadas en documentDirectory.
 * Pensada solo para uso en desarrollo (__DEV__).
 */
export function resetearBaseDeDatos(): void {
  db.execSync(TABLAS_A_LIMPIAR.map((tabla) => `DELETE FROM ${tabla};`).join('\n'));

  const directorioProductos = new Directory(Paths.document, CARPETA_PRODUCTOS);
  if (directorioProductos.exists) {
    directorioProductos.delete();
  }
}
