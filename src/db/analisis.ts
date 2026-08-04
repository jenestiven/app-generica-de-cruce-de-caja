import { getFechaHoy } from './fecha';
import { getTotalGastadoHoy } from './gastos';
import { db } from './setup';
import { getTotalVendidoHoy } from './ventas';

export interface ResumenHoy {
  totalVentas: number;
  totalGastos: number;
  utilidadNeta: number;
  cerrado: boolean;
  diferencia: number | null;
}

export interface ResumenMensual {
  totalVentas: number;
  totalGastos: number;
  utilidadNeta: number;
  diasOperados: number;
  promedioVentaDiaria: number;
}

export interface VentaDiaria {
  fecha: string;
  totalVentas: number;
}

export interface ProductoMasVendido {
  productoId: string;
  nombre: string;
  cantidadVendida: number;
}

export interface DiferenciaCajaDia {
  fecha: string;
  diferencia: number;
  corregido: boolean;
  fechaCorreccion: string | null;
  motivoCorreccion: string | null;
}

// "YYYY-MM-%" para filtrar cierres_caja.fecha (TEXT "YYYY-MM-DD") por mes/año.
function getPatronMes(mes: number, anio: number): string {
  const mesStr = String(mes).padStart(2, '0');
  return `${anio}-${mesStr}-%`;
}

// Rango [inicio, fin) del mes en hora local, convertido a ISO (UTC) para
// compararlo contra fecha_hora, que se guarda con new Date().toISOString().
function getRangoMes(mes: number, anio: number): { inicio: string; fin: string } {
  const inicio = new Date(anio, mes - 1, 1);
  const fin = new Date(anio, mes, 1);
  return { inicio: inicio.toISOString(), fin: fin.toISOString() };
}

export function getResumenHoy(): ResumenHoy {
  const { total: totalVentas } = getTotalVendidoHoy();
  const { total: totalGastos } = getTotalGastadoHoy();

  const cierre = db.getFirstSync<{ cerrado: number; diferencia: number | null }>(
    'SELECT cerrado, diferencia FROM cierres_caja WHERE fecha = ? LIMIT 1',
    [getFechaHoy()]
  );

  let cerrado = false;
  let diferencia: number | null = null;
  if (cierre && cierre.cerrado === 1) {
    cerrado = true;
    diferencia = cierre.diferencia;
  }

  return {
    totalVentas,
    totalGastos,
    utilidadNeta: totalVentas - totalGastos,
    cerrado,
    diferencia,
  };
}

export function getResumenMensual(mes: number, anio: number): ResumenMensual {
  const row = db.getFirstSync<{
    totalVentas: number;
    totalGastos: number;
    diasOperados: number;
  }>(
    `SELECT
       COALESCE(SUM(total_ventas), 0) AS totalVentas,
       COALESCE(SUM(total_gastos), 0) AS totalGastos,
       COUNT(*) AS diasOperados
     FROM cierres_caja
     WHERE cerrado = 1 AND fecha LIKE ?`,
    [getPatronMes(mes, anio)]
  ) ?? { totalVentas: 0, totalGastos: 0, diasOperados: 0 };

  const { totalVentas, totalGastos, diasOperados } = row;

  return {
    totalVentas,
    totalGastos,
    utilidadNeta: totalVentas - totalGastos,
    diasOperados,
    promedioVentaDiaria: diasOperados > 0 ? totalVentas / diasOperados : 0,
  };
}

export function getVentasDiariasDelMes(mes: number, anio: number): VentaDiaria[] {
  return db.getAllSync<VentaDiaria>(
    `SELECT fecha, total_ventas AS totalVentas
     FROM cierres_caja
     WHERE cerrado = 1 AND fecha LIKE ?
     ORDER BY fecha ASC`,
    [getPatronMes(mes, anio)]
  );
}

export function getProductosMasVendidos(
  mes: number,
  anio: number,
  limite: number
): ProductoMasVendido[] {
  const { inicio, fin } = getRangoMes(mes, anio);

  return db.getAllSync<ProductoMasVendido>(
    `SELECT vi.producto_id AS productoId, p.nombre AS nombre, SUM(vi.cantidad) AS cantidadVendida
     FROM venta_items vi
     JOIN ventas v ON v.id = vi.venta_id
     JOIN productos p ON p.id = vi.producto_id
     WHERE v.fecha_hora >= ? AND v.fecha_hora < ?
     GROUP BY vi.producto_id, p.nombre
     ORDER BY cantidadVendida DESC
     LIMIT ?`,
    [inicio, fin, limite]
  );
}

export function getHistorialDiferenciasCaja(mes: number, anio: number): DiferenciaCajaDia[] {
  const rows = db.getAllSync<{
    fecha: string;
    diferencia: number | null;
    corregido: number;
    fecha_correccion: string | null;
    motivo_correccion: string | null;
  }>(
    `SELECT fecha, diferencia, corregido, fecha_correccion, motivo_correccion
     FROM cierres_caja
     WHERE cerrado = 1 AND fecha LIKE ?
     ORDER BY fecha ASC`,
    [getPatronMes(mes, anio)]
  );

  return rows.map((row) => ({
    fecha: row.fecha,
    diferencia: row.diferencia ?? 0,
    corregido: row.corregido === 1,
    fechaCorreccion: row.fecha_correccion,
    motivoCorreccion: row.motivo_correccion,
  }));
}
