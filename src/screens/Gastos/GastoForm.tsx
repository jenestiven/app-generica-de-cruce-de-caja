import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { METODOS_PAGO_SELECCIONABLES, METODO_PAGO_LABEL } from '../Vender/metodoPago';
import type { CategoriaGasto } from '../../types/gasto';
import type { MetodoPago } from '../../types/venta';
import { CATEGORIA_GASTO_LABEL, CATEGORIA_GASTO_ORDEN } from './categoriaGasto';

export type GastoFormData = {
  descripcion: string;
  categoria: CategoriaGasto;
  monto: number;
  metodoPago: MetodoPago;
};

type GastoFormProps = {
  onGuardar: (data: GastoFormData) => void;
};

export default function GastoForm({ onGuardar }: GastoFormProps) {
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<CategoriaGasto>('insumos');
  const [montoTexto, setMontoTexto] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [errorDescripcion, setErrorDescripcion] = useState<string | null>(null);
  const [errorMonto, setErrorMonto] = useState<string | null>(null);

  function handleGuardar() {
    const descripcionLimpia = descripcion.trim();
    const monto = Number(montoTexto.replace(',', '.'));

    const nuevoErrorDescripcion =
      descripcionLimpia.length === 0 ? 'La descripción es requerida' : null;
    const nuevoErrorMonto =
      !Number.isFinite(monto) || monto <= 0 ? 'El monto debe ser mayor a 0' : null;

    setErrorDescripcion(nuevoErrorDescripcion);
    setErrorMonto(nuevoErrorMonto);

    if (nuevoErrorDescripcion !== null || nuevoErrorMonto !== null) {
      return;
    }

    onGuardar({ descripcion: descripcionLimpia, categoria, monto, metodoPago });

    setDescripcion('');
    setCategoria('insumos');
    setMontoTexto('');
    setMetodoPago('efectivo');
    setErrorDescripcion(null);
    setErrorMonto(null);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.input}
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Ej. Compra de carne"
        autoCapitalize="sentences"
      />
      {errorDescripcion !== null && <Text style={styles.error}>{errorDescripcion}</Text>}

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.chipRow}>
        {CATEGORIA_GASTO_ORDEN.map((opcion) => (
          <Pressable
            key={opcion}
            onPress={() => setCategoria(opcion)}
            style={[styles.chip, categoria === opcion && styles.chipSeleccionado]}
          >
            <Text style={[styles.chipTexto, categoria === opcion && styles.chipTextoSeleccionado]}>
              {CATEGORIA_GASTO_LABEL[opcion]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Monto</Text>
      <TextInput
        style={styles.input}
        value={montoTexto}
        onChangeText={setMontoTexto}
        placeholder="Ej. 20000"
        keyboardType="numeric"
      />
      {errorMonto !== null && <Text style={styles.error}>{errorMonto}</Text>}

      <Text style={styles.label}>Método de pago</Text>
      <View style={styles.chipRow}>
        {METODOS_PAGO_SELECCIONABLES.map((opcion) => (
          <Pressable
            key={opcion}
            onPress={() => setMetodoPago(opcion)}
            style={[styles.chip, metodoPago === opcion && styles.chipSeleccionado]}
          >
            <Text style={[styles.chipTexto, metodoPago === opcion && styles.chipTextoSeleccionado]}>
              {METODO_PAGO_LABEL[opcion]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.boton} onPress={handleGuardar}>
        <Text style={styles.botonTexto}>Registrar gasto</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSeleccionado: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  chipTexto: {
    fontSize: 14,
    color: '#333',
  },
  chipTextoSeleccionado: {
    color: '#fff',
    fontWeight: '600',
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
    marginTop: 20,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
