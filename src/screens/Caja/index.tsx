import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import { getCajaDeHoy } from '../../db/cierresCaja';
import type { CierreCaja } from '../../types/caja';
import CerrarCaja from './CerrarCaja';
import ResumenCierre from './ResumenCierre';

export default function CajaScreen() {
  const [caja, setCaja] = useState<CierreCaja | null>(() => getCajaDeHoy());

  useFocusEffect(
    useCallback(() => {
      setCaja(getCajaDeHoy());
    }, [])
  );

  function handleCerrada(cierre: CierreCaja) {
    setCaja(cierre);
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
    return <ResumenCierre cierre={caja} />;
  }

  return <CerrarCaja caja={caja} onCerrada={handleCerrada} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});
