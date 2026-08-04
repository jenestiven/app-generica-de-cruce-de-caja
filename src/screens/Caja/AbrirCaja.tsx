import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { abrirCaja, getUltimaBaseUsada } from '../../db/cierresCaja';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { CierreCaja } from '../../types/caja';

type AbrirCajaProps = {
  onCajaAbierta: (cierre: CierreCaja) => void;
};

export default function AbrirCaja({ onCajaAbierta }: AbrirCajaProps) {
  const [baseTexto, setBaseTexto] = useState(() => {
    const ultimaBase = getUltimaBaseUsada();
    return ultimaBase !== null ? String(ultimaBase) : '';
  });
  const [error, setError] = useState<string | null>(null);

  function handleAbrirCaja() {
    const textoLimpio = baseTexto.trim().replace(',', '.');
    const baseInicial = textoLimpio.length === 0 ? 0 : Number(textoLimpio);

    if (!Number.isFinite(baseInicial) || baseInicial < 0) {
      setError('Ingresa un monto válido');
      return;
    }

    setError(null);
    const cierre = abrirCaja(baseInicial);
    onCajaAbierta(cierre);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Abrir caja</Text>
      <Text style={styles.subtitulo}>
        Ingresa el monto base con el que abres la caja hoy para empezar a vender.
      </Text>

      <Input
        label="Monto base"
        value={baseTexto}
        onChangeText={setBaseTexto}
        placeholder="0"
        keyboardType="numeric"
        error={error ?? undefined}
      />

      <View style={styles.botonContainer}>
        <Button onPress={handleAbrirCaja}>Abrir caja</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
    backgroundColor: colors.background,
  },
  titulo: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitulo: {
    ...typography.cardText,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  botonContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
});
