import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Opcion<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  opciones: Opcion<T>[];
  valor: T;
  onCambiar: (valor: T) => void;
};

export default function SegmentedControl<T extends string>({
  opciones,
  valor,
  onCambiar,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {opciones.map((opcion) => {
        const activo = opcion.value === valor;
        return (
          <Pressable
            key={opcion.value}
            style={[styles.segmento, activo && styles.segmentoActivo]}
            onPress={() => onCambiar(opcion.value)}
          >
            <Text style={[styles.texto, activo && styles.textoActivo]}>{opcion.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 3,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  segmento: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentoActivo: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  texto: {
    ...typography.label,
    fontSize: 14,
    color: colors.textSecondary,
  },
  textoActivo: {
    color: colors.primary,
  },
});
