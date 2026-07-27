import * as Crypto from 'expo-crypto';

import { getFechaHoy } from './fecha';
import { getTotalGastadoHoy } from './gastos';
import { db } from './setup';
import { getTotalVendidoHoy } from './ventas';
import type { CierreCaja, PreviewCierre } from '../types/caja';

interface CierreCajaRow {
  id: string;
  fecha: string;
  base_inicial: number;
  total_ventas: number;
  total_ventas_efectivo: number;
  total_gastos: number;
  total_gastos_efectivo: number;
  efectivo_esperado: number;
  efectivo_contado: number | null;
  diferencia: number | null;
  utilidad_neta: number | null;
  cerrado: number;
  updated_at: string;
  synced_at: string | null;
}

function mapRowToCierreCaja(row: CierreCajaRow): CierreCaja {
  return {
    id: row.id,
    fecha: row.fecha,
    baseInicial: row.base_inicial,
    totalVentas: row.total_ventas,
    totalVentasEfectivo: row.total_ventas_efectivo,
    totalGastos: row.total_gastos,
    totalGastosEfectivo: row.total_gastos_efectivo,
    efectivoEsperado: row.efectivo_esperado,
    efectivoContado: row.efectivo_contado,
    diferencia: row.diferencia,
    utilidadNeta: row.utilidad_neta,
    cerrado: row.cerrado === 1,
    updatedAt: row.updated_at,
    syncedAt: row.synced_at,
  };
}

export function getCajaAbiertaHoy(): CierreCaja | null {
  const row = db.getFirstSync<CierreCajaRow>(
    'SELECT * FROM cierres_caja WHERE fecha = ? AND cerrado = 0 LIMIT 1',
    [getFechaHoy()]
  );
  return row ? mapRowToCierreCaja(row) : null;
}

export function abrirCaja(baseInicial: number): CierreCaja {
  const id = Crypto.randomUUID();
  const fecha = getFechaHoy();
  const updatedAt = new Date().toISOString();

  db.runSync(
    `INSERT INTO cierres_caja (id, fecha, base_inicial, cerrado, updated_at, synced_at)
     VALUES (?, ?, ?, 0, ?, NULL)`,
    [id, fecha, baseInicial, updatedAt]
  );

  return {
    id,
    fecha,
    baseInicial,
    totalVentas: 0,
    totalVentasEfectivo: 0,
    totalGastos: 0,
    totalGastosEfectivo: 0,
    efectivoEsperado: baseInicial,
    efectivoContado: null,
    diferencia: null,
    utilidadNeta: null,
    cerrado: false,
    updatedAt,
    syncedAt: null,
  };
}

export function getUltimaBaseUsada(): number | null {
  const row = db.getFirstSync<{ base_inicial: number }>(
    'SELECT base_inicial FROM cierres_caja ORDER BY fecha DESC LIMIT 1'
  );
  return row ? row.base_inicial : null;
}

export function getCajaDeHoy(): CierreCaja | null {
  const row = db.getFirstSync<CierreCajaRow>(
    'SELECT * FROM cierres_caja WHERE fecha = ? LIMIT 1',
    [getFechaHoy()]
  );
  return row ? mapRowToCierreCaja(row) : null;
}

// Calcula el cierre del día con los datos actuales, sin guardar nada.
// Usa la misma fórmula que cerrarCaja para que la vista previa y el cierre
// real nunca puedan quedar desincronizados.
export function previsualizarCierre(): PreviewCierre {
  const caja = getCajaAbiertaHoy();
  if (!caja) {
    throw new Error('No hay una caja abierta hoy para cerrar');
  }

  const { total: totalVentas, porMetodoPago: ventasPorMetodoPago } = getTotalVendidoHoy();
  const { total: totalGastos, porMetodoPago: gastosPorMetodoPago } = getTotalGastadoHoy();
  const efectivoEsperado =
    caja.baseInicial + ventasPorMetodoPago.efectivo - gastosPorMetodoPago.efectivo;

  return {
    baseInicial: caja.baseInicial,
    totalVentas,
    ventasPorMetodoPago,
    totalGastos,
    gastosPorMetodoPago,
    efectivoEsperado,
  };
}

export function cerrarCaja(efectivoContado: number): CierreCaja {
  const caja = getCajaAbiertaHoy();
  if (!caja) {
    throw new Error('No hay una caja abierta hoy para cerrar');
  }

  const preview = previsualizarCierre();
  const totalVentas = preview.totalVentas;
  const totalGastos = preview.totalGastos;
  const totalVentasEfectivo = preview.ventasPorMetodoPago.efectivo;
  const totalGastosEfectivo = preview.gastosPorMetodoPago.efectivo;
  const efectivoEsperado = preview.efectivoEsperado;
  const diferencia = efectivoContado - efectivoEsperado;
  const utilidadNeta = totalVentas - totalGastos;
  const updatedAt = new Date().toISOString();

  db.runSync(
    `UPDATE cierres_caja
     SET total_ventas = ?,
         total_ventas_efectivo = ?,
         total_gastos = ?,
         total_gastos_efectivo = ?,
         efectivo_esperado = ?,
         efectivo_contado = ?,
         diferencia = ?,
         utilidad_neta = ?,
         cerrado = 1,
         updated_at = ?,
         synced_at = NULL
     WHERE id = ?`,
    [
      totalVentas,
      totalVentasEfectivo,
      totalGastos,
      totalGastosEfectivo,
      efectivoEsperado,
      efectivoContado,
      diferencia,
      utilidadNeta,
      updatedAt,
      caja.id,
    ]
  );

  return {
    ...caja,
    totalVentas,
    totalVentasEfectivo,
    totalGastos,
    totalGastosEfectivo,
    efectivoEsperado,
    efectivoContado,
    diferencia,
    utilidadNeta,
    cerrado: true,
    updatedAt,
    syncedAt: null,
  };
}
