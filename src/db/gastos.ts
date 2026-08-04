import * as Crypto from 'expo-crypto';

import { getRangoHoy } from './fecha';
import { db } from './setup';
import type { CategoriaGasto, CrearGastoInput, Gasto, TotalGastadoHoy } from '../types/gasto';
import type { MetodoPago } from '../types/venta';

interface GastoRow {
  id: string;
  fecha_hora: string;
  descripcion: string;
  categoria: CategoriaGasto;
  monto: number;
  metodo_pago: MetodoPago;
  updated_at: string;
  synced_at: string | null;
}

function mapRowToGasto(row: GastoRow): Gasto {
  return {
    id: row.id,
    fechaHora: row.fecha_hora,
    descripcion: row.descripcion,
    categoria: row.categoria,
    monto: row.monto,
    metodoPago: row.metodo_pago,
    updatedAt: row.updated_at,
    syncedAt: row.synced_at,
  };
}

export function crearGasto(data: CrearGastoInput): Gasto {
  const id = Crypto.randomUUID();
  const fechaHora = new Date().toISOString();

  db.runSync(
    `INSERT INTO gastos (id, fecha_hora, descripcion, categoria, monto, metodo_pago, updated_at, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
    [id, fechaHora, data.descripcion, data.categoria, data.monto, data.metodoPago, fechaHora]
  );

  return {
    id,
    fechaHora,
    descripcion: data.descripcion,
    categoria: data.categoria,
    monto: data.monto,
    metodoPago: data.metodoPago,
    updatedAt: fechaHora,
    syncedAt: null,
  };
}

export function getGastosDeHoy(): Gasto[] {
  const { inicio, fin } = getRangoHoy();
  const rows = db.getAllSync<GastoRow>(
    'SELECT * FROM gastos WHERE fecha_hora >= ? AND fecha_hora < ? ORDER BY fecha_hora ASC',
    [inicio, fin]
  );
  return rows.map(mapRowToGasto);
}

export function getTodosLosGastos(): Gasto[] {
  const rows = db.getAllSync<GastoRow>('SELECT * FROM gastos ORDER BY fecha_hora ASC');
  return rows.map(mapRowToGasto);
}

export function getTotalGastadoHoy(): TotalGastadoHoy {
  const gastos = getGastosDeHoy();

  const porMetodoPago: Record<MetodoPago, number> = {
    efectivo: 0,
    transferencia: 0,
    tarjeta: 0,
  };

  let total = 0;
  for (const gasto of gastos) {
    total += gasto.monto;
    porMetodoPago[gasto.metodoPago] += gasto.monto;
  }

  return { total, porMetodoPago };
}
