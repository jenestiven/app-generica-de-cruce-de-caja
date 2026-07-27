import type { CategoriaGasto } from '../../types/gasto';

export const CATEGORIA_GASTO_ORDEN: CategoriaGasto[] = [
  'insumos',
  'domicilio',
  'servicios',
  'otro',
];

export const CATEGORIA_GASTO_LABEL: Record<CategoriaGasto, string> = {
  insumos: 'Insumos',
  domicilio: 'Domicilio',
  servicios: 'Servicios',
  otro: 'Otro',
};
