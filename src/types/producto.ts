export type CategoriaProducto = 'plato_fuerte' | 'bebida' | 'coctel' | 'adicion';

export interface Producto {
  id: string;
  nombre: string;
  categoria: CategoriaProducto;
  precio: number;
  activo: boolean;
  imagenUri: string | null;
  updatedAt: string;
  syncedAt: string | null;
}

export interface CrearProductoInput {
  nombre: string;
  categoria: CategoriaProducto;
  precio: number;
  imagenUri?: string | null;
}

export interface ActualizarProductoInput {
  nombre?: string;
  categoria?: CategoriaProducto;
  precio?: number;
  activo?: boolean;
  imagenUri?: string | null;
}
