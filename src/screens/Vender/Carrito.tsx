import { Pressable, StyleSheet, Text, View } from 'react-native';

import Button from '../../components/ui/Button';
import StepperControl from '../../components/ui/StepperControl';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatPrecio } from '../Menu/formatPrecio';
import type { CarritoItem } from './carritoUtils';

type CarritoProps = {
  items: CarritoItem[];
  total: number;
  onCambiarCantidad: (productoId: string, cantidad: number) => void;
  onQuitarProducto: (productoId: string) => void;
  onRegistrarVenta: () => void;
};

export default function Carrito({
  items,
  total,
  onCambiarCantidad,
  onQuitarProducto,
  onRegistrarVenta,
}: CarritoProps) {
  const vacio = items.length === 0;

  return (
    <View style={styles.container}>
      {!vacio && (
        <View style={styles.items}>
          {items.map((item) => (
            <View key={item.producto.id} style={styles.item}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemNombre}>{item.producto.nombre}</Text>
                <Text style={styles.itemSubtotal}>
                  {formatPrecio(item.producto.precio * item.cantidad)}
                </Text>
              </View>
              <View style={styles.itemControles}>
                <StepperControl
                  value={item.cantidad}
                  onIncrement={() => onCambiarCantidad(item.producto.id, item.cantidad + 1)}
                  onDecrement={() => onCambiarCantidad(item.producto.id, item.cantidad - 1)}
                />
                <Pressable
                  style={styles.quitarBoton}
                  onPress={() => onQuitarProducto(item.producto.id)}
                >
                  <Text style={styles.quitarBotonTexto}>Quitar</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValor}>{formatPrecio(total)}</Text>
        </View>
        <Button onPress={onRegistrarVenta} disabled={vacio}>
          Registrar venta
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  items: {
    maxHeight: 220,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  item: {
    marginBottom: spacing.md,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemNombre: {
    ...typography.cardText,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemSubtotal: {
    ...typography.cardText,
    color: colors.textPrimary,
  },
  itemControles: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  quitarBoton: {
    marginLeft: 'auto',
  },
  quitarBotonTexto: {
    ...typography.label,
    color: colors.danger,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalContainer: {
    marginRight: spacing.md,
  },
  totalLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  totalValor: {
    ...typography.numberLarge,
    color: colors.textPrimary,
  },
});
