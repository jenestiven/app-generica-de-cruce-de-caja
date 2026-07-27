import type { MetodoPago } from './venta';

export interface CierreCaja {
  id: string;
  fecha: string; // YYYY-MM-DD, sin hora
  baseInicial: number;
  totalVentas: number;
  totalVentasEfectivo: number;
  totalGastos: number;
  totalGastosEfectivo: number;
  efectivoEsperado: number;
  efectivoContado: number | null;
  diferencia: number | null;
  utilidadNeta: number | null;
  cerrado: boolean;
  updatedAt: string;
  syncedAt: string | null;
}

// Cálculo en vivo del cierre del día, sin guardar nada todavía.
export interface PreviewCierre {
  baseInicial: number;
  totalVentas: number;
  ventasPorMetodoPago: Record<MetodoPago, number>;
  totalGastos: number;
  gastosPorMetodoPago: Record<MetodoPago, number>;
  efectivoEsperado: number;
}
