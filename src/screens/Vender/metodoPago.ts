import type { MetodoPago } from '../../types/venta';

export const METODOS_PAGO_SELECCIONABLES: MetodoPago[] = ['efectivo', 'transferencia'];

export const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
};
