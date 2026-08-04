import * as Crypto from 'expo-crypto';

import { getRangoHoy } from './fecha';
import { db } from './setup';
import type {
  CrearVentaItemInput,
  MetodoPago,
  TotalVendidoHoy,
  Venta,
  VentaItem,
} from '../types/venta';

interface VentaRow {
  id: string;
  fecha_hora: string;
  total: number;
  metodo_pago: MetodoPago;
  updated_at: string;
  synced_at: string | null;
}

function mapRowToVenta(row: VentaRow): Venta {
  return {
    id: row.id,
    fechaHora: row.fecha_hora,
    total: row.total,
    metodoPago: row.metodo_pago,
    updatedAt: row.updated_at,
    syncedAt: row.synced_at,
  };
}

interface VentaItemRow {
  id: string;
  venta_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

function mapRowToVentaItem(row: VentaItemRow): VentaItem {
  return {
    id: row.id,
    ventaId: row.venta_id,
    productoId: row.producto_id,
    cantidad: row.cantidad,
    precioUnitario: row.precio_unitario,
    subtotal: row.subtotal,
  };
}

export function crearVenta(
  items: CrearVentaItemInput[],
  metodoPago: MetodoPago
): Venta {
  const id = Crypto.randomUUID();
  const fechaHora = new Date().toISOString();
  const total = items.reduce(
    (acc, item) => acc + item.cantidad * item.precioUnitario,
    0
  );

  db.withTransactionSync(() => {
    db.runSync(
      `INSERT INTO ventas (id, fecha_hora, total, metodo_pago, updated_at, synced_at)
       VALUES (?, ?, ?, ?, ?, NULL)`,
      [id, fechaHora, total, metodoPago, fechaHora]
    );

    for (const item of items) {
      db.runSync(
        `INSERT INTO venta_items (id, venta_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          Crypto.randomUUID(),
          id,
          item.productoId,
          item.cantidad,
          item.precioUnitario,
          item.cantidad * item.precioUnitario,
        ]
      );
    }
  });

  return {
    id,
    fechaHora,
    total,
    metodoPago,
    updatedAt: fechaHora,
    syncedAt: null,
  };
}

export function getVentasDeHoy(): Venta[] {
  const { inicio, fin } = getRangoHoy();
  const rows = db.getAllSync<VentaRow>(
    'SELECT * FROM ventas WHERE fecha_hora >= ? AND fecha_hora < ? ORDER BY fecha_hora ASC',
    [inicio, fin]
  );
  return rows.map(mapRowToVenta);
}

export function getTodasLasVentas(): Venta[] {
  const rows = db.getAllSync<VentaRow>('SELECT * FROM ventas ORDER BY fecha_hora ASC');
  return rows.map(mapRowToVenta);
}

export function getTodosLosVentaItems(): VentaItem[] {
  const rows = db.getAllSync<VentaItemRow>('SELECT * FROM venta_items ORDER BY id ASC');
  return rows.map(mapRowToVentaItem);
}

export function getTotalVendidoHoy(): TotalVendidoHoy {
  const ventas = getVentasDeHoy();

  const porMetodoPago: Record<MetodoPago, number> = {
    efectivo: 0,
    transferencia: 0,
    tarjeta: 0,
  };

  let total = 0;
  for (const venta of ventas) {
    total += venta.total;
    porMetodoPago[venta.metodoPago] += venta.total;
  }

  return { total, porMetodoPago };
}
