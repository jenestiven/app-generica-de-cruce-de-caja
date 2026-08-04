import * as Notifications from 'expo-notifications';

const DOMINGO = 1;
const HORA_RECORDATORIO = 20;
const MINUTO_RECORDATORIO = 0;

/**
 * Pide permiso de notificaciones al sistema (si ya fue concedido antes, no
 * vuelve a mostrar el diálogo). Retorna si el permiso quedó concedido.
 */
export async function solicitarPermisoNotificaciones(): Promise<boolean> {
  const permisos = await Notifications.getPermissionsAsync();
  if (permisos.granted) {
    return true;
  }

  const solicitados = await Notifications.requestPermissionsAsync();
  return solicitados.granted;
}

/**
 * Cancela cualquier recordatorio previo programado por esta app y programa
 * uno nuevo, repetible cada domingo a las 8:00pm.
 */
export async function programarRecordatorioSemanal(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Respaldo semanal',
      body: 'No olvides exportar el respaldo de tu semana',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: DOMINGO,
      hour: HORA_RECORDATORIO,
      minute: MINUTO_RECORDATORIO,
    },
  });
}

export async function cancelarRecordatorioSemanal(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
