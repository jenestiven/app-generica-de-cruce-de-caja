import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import Button from '../../components/ui/Button';
import { getFechaUltimoRespaldo, getRecordatorioActivado, setRecordatorioActivado } from '../../db/config';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { generarYCompartirRespaldo } from '../../utils/exportarRespaldo';
import {
  cancelarRecordatorioSemanal,
  programarRecordatorioSemanal,
  solicitarPermisoNotificaciones,
} from '../../utils/recordatorios';
import HoyView from './HoyView';
import MensualView from './MensualView';
import SegmentedControl from './SegmentedControl';

type Vista = 'hoy' | 'mensual';

const DIAS_LIMITE_RESPALDO = 14;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

function formatFechaRespaldo(fecha: Date): string {
  return fecha.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AnalisisScreen() {
  const [vista, setVista] = useState<Vista>('hoy');
  const [fechaUltimoRespaldo, setFechaUltimoRespaldo] = useState<Date | null>(() =>
    getFechaUltimoRespaldo()
  );
  const [recordatorioActivo, setRecordatorioActivo] = useState<boolean>(() =>
    getRecordatorioActivado()
  );

  useFocusEffect(
    useCallback(() => {
      setFechaUltimoRespaldo(getFechaUltimoRespaldo());
      setRecordatorioActivo(getRecordatorioActivado());
    }, [])
  );

  async function handleExportarRespaldo() {
    await generarYCompartirRespaldo();
    setFechaUltimoRespaldo(getFechaUltimoRespaldo());
  }

  async function handleToggleRecordatorio(activar: boolean) {
    if (activar) {
      const permisoConcedido = await solicitarPermisoNotificaciones();
      if (!permisoConcedido) {
        Alert.alert(
          'Permiso de notificaciones no concedido',
          'No podrás recibir el recordatorio semanal sin permitir las notificaciones para esta app en los ajustes del sistema.'
        );
        return;
      }
      await programarRecordatorioSemanal();
      setRecordatorioActivado(true);
      setRecordatorioActivo(true);
    } else {
      await cancelarRecordatorioSemanal();
      setRecordatorioActivado(false);
      setRecordatorioActivo(false);
    }
  }

  const diasDesdeUltimoRespaldo = fechaUltimoRespaldo
    ? (Date.now() - fechaUltimoRespaldo.getTime()) / MS_POR_DIA
    : null;
  const respaldoDesactualizado =
    diasDesdeUltimoRespaldo !== null && diasDesdeUltimoRespaldo > DIAS_LIMITE_RESPALDO;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Análisis</Text>

      <SegmentedControl
        opciones={[
          { value: 'hoy', label: 'Hoy' },
          { value: 'mensual', label: 'Mensual' },
        ]}
        valor={vista}
        onCambiar={setVista}
      />

      {vista === 'hoy' ? <HoyView /> : <MensualView />}

      <View style={styles.respaldoSeccion}>
        <Button onPress={handleExportarRespaldo} variant="secondary">
          Exportar respaldo completo
        </Button>
        <Text
          style={[
            styles.respaldoTexto,
            respaldoDesactualizado ? styles.respaldoTextoAlerta : styles.respaldoTextoNormal,
          ]}
        >
          {fechaUltimoRespaldo
            ? `Último respaldo: ${formatFechaRespaldo(fechaUltimoRespaldo)}`
            : 'Nunca se ha exportado un respaldo'}
        </Text>

        <View style={styles.recordatorioFila}>
          <Text style={styles.recordatorioTexto}>Recordarme cada semana</Text>
          <Switch
            value={recordatorioActivo}
            onValueChange={handleToggleRecordatorio}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: spacing.xxl,
  },
  titulo: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  respaldoSeccion: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  respaldoTexto: {
    ...typography.label,
    marginTop: spacing.sm,
  },
  respaldoTextoNormal: {
    color: colors.textSecondary,
  },
  respaldoTextoAlerta: {
    color: colors.danger,
  },
  recordatorioFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  recordatorioTexto: {
    ...typography.cardText,
    color: colors.textPrimary,
  },
});
