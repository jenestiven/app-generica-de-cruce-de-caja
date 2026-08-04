import { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { getCajaDeHoy, iniciarCorreccion, puedeCorregirse } from '../../db/cierresCaja';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { CierreCaja } from '../../types/caja';
import type { RootTabParamList } from '../../types/navigation';
import CerrarCaja from './CerrarCaja';
import ResumenCierre from './ResumenCierre';

export default function CajaScreen() {
  const [caja, setCaja] = useState<CierreCaja | null>(() => getCajaDeHoy());
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  useFocusEffect(
    useCallback(() => {
      setCaja(getCajaDeHoy());
    }, [])
  );

  function handleCerrada(cierre: CierreCaja) {
    setCaja(cierre);
  }

  function handleCorregir() {
    if (caja === null) {
      return;
    }
    const cierreId = caja.id;

    Alert.alert(
      'Corregir cierre de hoy',
      'Vas a poder agregar ventas o gastos que falten. Al terminar, tendrás que confirmar el cierre de nuevo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => {
            iniciarCorreccion(cierreId);
            setCaja(getCajaDeHoy());
            navigation.navigate('Vender');
          },
        },
      ]
    );
  }

  if (caja === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>No hay caja abierta hoy</Text>
        <Text style={styles.subtitulo}>
          Abre la caja desde la pestaña Vender o Gastos para poder cerrarla al final del día.
        </Text>
      </View>
    );
  }

  if (caja.cerrado) {
    return (
      <ResumenCierre cierre={caja} onCorregir={puedeCorregirse(caja) ? handleCorregir : undefined} />
    );
  }

  return <CerrarCaja caja={caja} onCerrada={handleCerrada} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginTop: spacing.xxl,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  titulo: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitulo: {
    ...typography.cardText,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
