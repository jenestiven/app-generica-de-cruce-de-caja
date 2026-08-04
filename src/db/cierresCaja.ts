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
  en_correccion: number;
  corregido: number;
  fecha_correccion: string | null;
  motivo_correccion: string | null;
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
    enCorreccion: row.en_correccion === 1,
    corregido: row.corregido === 1,
    fechaCorreccion: row.fecha_correccion,
    motivoCorreccion: row.motivo_correccion,
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
    enCorreccion: false,
    corregido: false,
    fechaCorreccion: null,
    motivoCorreccion: null,
    updatedAt,
    syncedAt: null,
  };
}

export function getTodosLosCierres(): CierreCaja[] {
  const rows = db.getAllSync<CierreCajaRow>('SELECT * FROM cierres_caja ORDER BY fecha ASC');
  return rows.map(mapRowToCierreCaja);
}

export function getCierrePorId(id: string): CierreCaja | null {
  const row = db.getFirstSync<CierreCajaRow>('SELECT * FROM cierres_caja WHERE id = ? LIMIT 1', [
    id,
  ]);
  return row ? mapRowToCierreCaja(row) : null;
}

// Un cierre solo puede corregirse el mismo día calendario en que se hizo
// (comparamos "fecha", que ya es date-only, no la hora del cierre).
export function puedeCorregirse(cierre: CierreCaja): boolean {
  return cierre.cerrado && cierre.fecha === getFechaHoy();
}

// Vender y Gastos usan esto para decidir si el día sigue habilitado para
// registrar: caja abierta, o en corrección mientras la fecha del cierre
// sigue siendo hoy (misma comparación que puedeCorregirse). Si en_correccion
// quedó activo pero ya cruzó la medianoche, se trata como cerrado.
export function puedeRegistrarHoy(cierre: CierreCaja): boolean {
  if (!cierre.cerrado) {
    return true;
  }
  return cierre.enCorreccion && cierre.fecha === getFechaHoy();
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

// Usa la misma fórmula que cerrarCaja/confirmarCorreccion para que la vista
// previa y el cierre real nunca puedan quedar desincronizados.
function calcularPreview(baseInicial: number): PreviewCierre {
  const { total: totalVentas, porMetodoPago: ventasPorMetodoPago } = getTotalVendidoHoy();
  const { total: totalGastos, porMetodoPago: gastosPorMetodoPago } = getTotalGastadoHoy();
  const efectivoEsperado =
    baseInicial + ventasPorMetodoPago.efectivo - gastosPorMetodoPago.efectivo;

  return {
    baseInicial,
    totalVentas,
    ventasPorMetodoPago,
    totalGastos,
    gastosPorMetodoPago,
    efectivoEsperado,
  };
}

// Calcula el cierre del día con los datos actuales, sin guardar nada.
export function previsualizarCierre(): PreviewCierre {
  const caja = getCajaAbiertaHoy();
  if (!caja) {
    throw new Error('No hay una caja abierta hoy para cerrar');
  }
  return calcularPreview(caja.baseInicial);
}

// Igual que previsualizarCierre, pero para un cierre que ya está cerrado y en
// corrección (cerrado sigue en true mientras se corrige, por eso no puede
// buscarse con getCajaAbiertaHoy).
export function previsualizarCorreccion(cierreId: string): PreviewCierre {
  const cierre = getCierrePorId(cierreId);
  if (!cierre) {
    throw new Error('No existe el cierre a corregir');
  }
  return calcularPreview(cierre.baseInicial);
}

interface CalculoCierre {
  totalVentas: number;
  totalVentasEfectivo: number;
  totalGastos: number;
  totalGastosEfectivo: number;
  efectivoEsperado: number;
  diferencia: number;
  utilidadNeta: number;
}

// Misma fórmula que usan previsualizarCierre/cerrarCaja, reutilizada también
// por confirmarCorreccion para que un cierre corregido nunca se calcule distinto.
function calcularCierre(baseInicial: number, efectivoContado: number): CalculoCierre {
  const { total: totalVentas, porMetodoPago: ventasPorMetodoPago } = getTotalVendidoHoy();
  const { total: totalGastos, porMetodoPago: gastosPorMetodoPago } = getTotalGastadoHoy();
  const totalVentasEfectivo = ventasPorMetodoPago.efectivo;
  const totalGastosEfectivo = gastosPorMetodoPago.efectivo;
  const efectivoEsperado = baseInicial + totalVentasEfectivo - totalGastosEfectivo;

  return {
    totalVentas,
    totalVentasEfectivo,
    totalGastos,
    totalGastosEfectivo,
    efectivoEsperado,
    diferencia: efectivoContado - efectivoEsperado,
    utilidadNeta: totalVentas - totalGastos,
  };
}

interface GuardarCierreOpciones {
  cerrado: boolean;
  enCorreccion: boolean;
  corregido: boolean;
  fechaCorreccion: string | null;
  motivoCorreccion: string | null;
  updatedAt: string;
}

function guardarCierre(
  cierreId: string,
  calculo: CalculoCierre,
  efectivoContado: number,
  opciones: GuardarCierreOpciones
): void {
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
         cerrado = ?,
         en_correccion = ?,
         corregido = ?,
         fecha_correccion = ?,
         motivo_correccion = ?,
         updated_at = ?,
         synced_at = NULL
     WHERE id = ?`,
    [
      calculo.totalVentas,
      calculo.totalVentasEfectivo,
      calculo.totalGastos,
      calculo.totalGastosEfectivo,
      calculo.efectivoEsperado,
      efectivoContado,
      calculo.diferencia,
      calculo.utilidadNeta,
      opciones.cerrado ? 1 : 0,
      opciones.enCorreccion ? 1 : 0,
      opciones.corregido ? 1 : 0,
      opciones.fechaCorreccion,
      opciones.motivoCorreccion,
      opciones.updatedAt,
      cierreId,
    ]
  );
}

export function cerrarCaja(efectivoContado: number): CierreCaja {
  const caja = getCajaAbiertaHoy();
  if (!caja) {
    throw new Error('No hay una caja abierta hoy para cerrar');
  }

  const calculo = calcularCierre(caja.baseInicial, efectivoContado);
  const updatedAt = new Date().toISOString();

  guardarCierre(caja.id, calculo, efectivoContado, {
    cerrado: true,
    enCorreccion: false,
    corregido: false,
    fechaCorreccion: null,
    motivoCorreccion: null,
    updatedAt,
  });

  return {
    ...caja,
    ...calculo,
    efectivoContado,
    cerrado: true,
    enCorreccion: false,
    corregido: false,
    fechaCorreccion: null,
    motivoCorreccion: null,
    updatedAt,
    syncedAt: null,
  };
}

// Solo marca que el cierre está en corrección: no toca totales ni `cerrado`.
export function iniciarCorreccion(cierreId: string): void {
  db.runSync(
    'UPDATE cierres_caja SET en_correccion = 1, updated_at = ?, synced_at = NULL WHERE id = ?',
    [new Date().toISOString(), cierreId]
  );
}

export function confirmarCorreccion(
  cierreId: string,
  efectivoContado: number,
  motivo?: string
): CierreCaja {
  const cierre = getCierrePorId(cierreId);
  if (!cierre) {
    throw new Error('No existe el cierre a corregir');
  }

  const calculo = calcularCierre(cierre.baseInicial, efectivoContado);
  const updatedAt = new Date().toISOString();
  const motivoCorreccion = motivo ?? null;

  guardarCierre(cierreId, calculo, efectivoContado, {
    cerrado: true,
    enCorreccion: false,
    corregido: true,
    fechaCorreccion: updatedAt,
    motivoCorreccion,
    updatedAt,
  });

  return {
    ...cierre,
    ...calculo,
    efectivoContado,
    cerrado: true,
    enCorreccion: false,
    corregido: true,
    fechaCorreccion: updatedAt,
    motivoCorreccion,
    updatedAt,
    syncedAt: null,
  };
}
