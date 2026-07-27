import type { Producto } from '../../types/producto';

export type CarritoItem = {
  producto: Producto;
  cantidad: number;
};

export function agregarProducto(carrito: CarritoItem[], producto: Producto): CarritoItem[] {
  const existente = carrito.find((item) => item.producto.id === producto.id);

  if (existente) {
    return carrito.map((item) =>
      item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
    );
  }

  return [...carrito, { producto, cantidad: 1 }];
}

export function cambiarCantidad(
  carrito: CarritoItem[],
  productoId: string,
  cantidad: number
): CarritoItem[] {
  if (cantidad <= 0) {
    return quitarProducto(carrito, productoId);
  }

  return carrito.map((item) =>
    item.producto.id === productoId ? { ...item, cantidad } : item
  );
}

export function quitarProducto(carrito: CarritoItem[], productoId: string): CarritoItem[] {
  return carrito.filter((item) => item.producto.id !== productoId);
}

export function calcularTotal(carrito: CarritoItem[]): number {
  return carrito.reduce((acc, item) => acc + item.cantidad * item.producto.precio, 0);
}
