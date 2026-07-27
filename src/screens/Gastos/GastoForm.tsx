import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../../components/ui/Button';
import Chip from '../../components/ui/Chip';
import Input from '../../components/ui/Input';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
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
      <Input
        label="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Ej. Compra de carne"
        autoCapitalize="sentences"
        error={errorDescripcion ?? undefined}
      />

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.chipRow}>
        {CATEGORIA_GASTO_ORDEN.map((opcion) => (
          <Chip
            key={opcion}
            label={CATEGORIA_GASTO_LABEL[opcion]}
            selected={categoria === opcion}
            onPress={() => setCategoria(opcion)}
          />
        ))}
      </View>

      <Input
        label="Monto"
        value={montoTexto}
        onChangeText={setMontoTexto}
        placeholder="Ej. 20000"
        keyboardType="numeric"
        error={errorMonto ?? undefined}
      />

      <Text style={styles.label}>Método de pago</Text>
      <View style={styles.chipRow}>
        {METODOS_PAGO_SELECCIONABLES.map((opcion) => (
          <Chip
            key={opcion}
            label={METODO_PAGO_LABEL[opcion]}
            selected={metodoPago === opcion}
            onPress={() => setMetodoPago(opcion)}
          />
        ))}
      </View>

      <View style={styles.botonContainer}>
        <Button onPress={handleGuardar}>Registrar gasto</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  botonContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});
