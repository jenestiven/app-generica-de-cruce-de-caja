// Fechas en hora local del dispositivo, no UTC, para que "hoy" sea confiable
// sin importar la hora del día en que se use la app.

export function getFechaHoy(): string {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, '0');
  const day = String(ahora.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRangoHoy(): { inicio: string; fin: string } {
  const ahora = new Date();
  const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 1);
  return { inicio: inicio.toISOString(), fin: fin.toISOString() };
}
