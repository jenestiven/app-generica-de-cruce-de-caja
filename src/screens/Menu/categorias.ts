import type { CategoriaProducto } from '../../types/producto';

export const CATEGORIA_ORDEN: CategoriaProducto[] = [
  'plato_fuerte',
  'bebida',
  'coctel',
  'adicion',
];

export const CATEGORIA_LABEL: Record<CategoriaProducto, string> = {
  plato_fuerte: 'Platos fuertes',
  bebida: 'Bebidas',
  coctel: 'Cócteles',
  adicion: 'Adiciones',
};

export const CATEGORIA_ICONO: Record<CategoriaProducto, string> = {
  plato_fuerte: '🍔',
  bebida: '🥤',
  coctel: '🍹',
  adicion: '🍟',
};
