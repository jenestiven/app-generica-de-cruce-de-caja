import type { MetodoPago } from './venta';

export type CategoriaGasto = 'insumos' | 'domicilio' | 'servicios' | 'otro';

export interface Gasto {
  id: string;
  fechaHora: string;
  descripcion: string;
  categoria: CategoriaGasto;
  monto: number;
  metodoPago: MetodoPago;
  updatedAt: string;
  syncedAt: string | null;
}

export interface CrearGastoInput {
  descripcion: string;
  categoria: CategoriaGasto;
  monto: number;
  metodoPago: MetodoPago;
}

export interface TotalGastadoHoy {
  total: number;
  porMetodoPago: Record<MetodoPago, number>;
}
