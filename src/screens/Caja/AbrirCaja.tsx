import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { abrirCaja, getUltimaBaseUsada } from '../../db/cierresCaja';
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

      <Text style={styles.label}>Monto base</Text>
      <TextInput
        style={styles.input}
        value={baseTexto}
        onChangeText={setBaseTexto}
        placeholder="0"
        keyboardType="numeric"
      />
      {error !== null && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.boton} onPress={handleAbrirCaja}>
        <Text style={styles.botonTexto}>Abrir caja</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    color: '#dc2626',
    marginTop: 6,
  },
  boton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
