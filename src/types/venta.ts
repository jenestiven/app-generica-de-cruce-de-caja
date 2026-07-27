export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta';

export interface Venta {
  id: string;
  fechaHora: string;
  total: number;
  metodoPago: MetodoPago;
  updatedAt: string;
  syncedAt: string | null;
}

export interface VentaItem {
  id: string;
  ventaId: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CrearVentaItemInput {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
}

export interface TotalVendidoHoy {
  total: number;
  porMetodoPago: Record<MetodoPago, number>;
}
