import * as Crypto from 'expo-crypto';

import { db } from './setup';
import type {
  ActualizarProductoInput,
  CrearProductoInput,
  Producto,
} from '../types/producto';

interface ProductoRow {
  id: string;
  nombre: string;
  categoria: Producto['categoria'];
  precio: number;
  activo: number;
  updated_at: string;
  synced_at: string | null;
}

function mapRowToProducto(row: ProductoRow): Producto {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    precio: row.precio,
    activo: row.activo === 1,
    updatedAt: row.updated_at,
    syncedAt: row.synced_at,
  };
}

export function getProductos(): Producto[] {
  const rows = db.getAllSync<ProductoRow>(
    'SELECT * FROM productos ORDER BY nombre ASC'
  );
  return rows.map(mapRowToProducto);
}

export function crearProducto(data: CrearProductoInput): Producto {
  const id = Crypto.randomUUID();
  const updatedAt = new Date().toISOString();

  db.runSync(
    `INSERT INTO productos (id, nombre, categoria, precio, activo, updated_at, synced_at)
     VALUES (?, ?, ?, ?, 1, ?, NULL)`,
    [id, data.nombre, data.categoria, data.precio, updatedAt]
  );

  return {
    id,
    nombre: data.nombre,
    categoria: data.categoria,
    precio: data.precio,
    activo: true,
    updatedAt,
    syncedAt: null,
  };
}

export function actualizarProducto(
  id: string,
  data: ActualizarProductoInput
): void {
  const campos: string[] = [];
  const valores: (string | number)[] = [];

  if (data.nombre !== undefined) {
    campos.push('nombre = ?');
    valores.push(data.nombre);
  }
  if (data.categoria !== undefined) {
    campos.push('categoria = ?');
    valores.push(data.categoria);
  }
  if (data.precio !== undefined) {
    campos.push('precio = ?');
    valores.push(data.precio);
  }
  if (data.activo !== undefined) {
    campos.push('activo = ?');
    valores.push(data.activo ? 1 : 0);
  }

  if (campos.length === 0) {
    return;
  }

  campos.push('updated_at = ?');
  valores.push(new Date().toISOString());
  valores.push(id);

  db.runSync(
    `UPDATE productos SET ${campos.join(', ')} WHERE id = ?`,
    valores
  );
}

export function desactivarProducto(id: string): void {
  db.runSync(
    'UPDATE productos SET activo = 0, updated_at = ? WHERE id = ?',
    [new Date().toISOString(), id]
  );
}
