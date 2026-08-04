import { db } from './setup';

const KEY_FECHA_ULTIMO_RESPALDO = 'fecha_ultimo_respaldo';
const KEY_RECORDATORIO_ACTIVADO = 'recordatorio_activado';

function getValue(key: string): string | null {
  const row = db.getFirstSync<{ value: string }>('SELECT value FROM config WHERE key = ?', [key]);
  return row ? row.value : null;
}

function setValue(key: string, value: string): void {
  db.runSync('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)', [key, value]);
}

export function getFechaUltimoRespaldo(): Date | null {
  const value = getValue(KEY_FECHA_ULTIMO_RESPALDO);
  return value ? new Date(value) : null;
}

export function setFechaUltimoRespaldo(fecha: Date): void {
  setValue(KEY_FECHA_ULTIMO_RESPALDO, fecha.toISOString());
}

export function getRecordatorioActivado(): boolean {
  const value = getValue(KEY_RECORDATORIO_ACTIVADO);
  return value === null ? true : value === '1';
}

export function setRecordatorioActivado(activado: boolean): void {
  setValue(KEY_RECORDATORIO_ACTIVADO, activado ? '1' : '0');
}
