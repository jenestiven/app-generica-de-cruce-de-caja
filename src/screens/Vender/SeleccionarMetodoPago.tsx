import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { MetodoPago } from '../../types/venta';
import { formatPrecio } from '../Menu/formatPrecio';
import { METODO_PAGO_LABEL, METODOS_PAGO_SELECCIONABLES } from './metodoPago';

type SeleccionarMetodoPagoProps = {
  visible: boolean;
  total: number;
  onConfirmar: (metodoPago: MetodoPago) => void;
  onCancelar: () => void;
};

export default function SeleccionarMetodoPago({
  visible,
  total,
  onConfirmar,
  onCancelar,
}: SeleccionarMetodoPagoProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancelar}>
      <View style={styles.fondo}>
        <View style={styles.contenido}>
          <Text style={styles.titulo}>Método de pago</Text>
          <Text style={styles.total}>{formatPrecio(total)}</Text>

          {METODOS_PAGO_SELECCIONABLES.map((metodo) => (
            <Pressable key={metodo} style={styles.opcion} onPress={() => onConfirmar(metodo)}>
              <Text style={styles.opcionTexto}>{METODO_PAGO_LABEL[metodo]}</Text>
            </Pressable>
          ))}

          <Pressable style={styles.cancelar} onPress={onCancelar}>
            <Text style={styles.cancelarTexto}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  contenido: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111',
  },
  total: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2563eb',
    marginTop: 4,
    marginBottom: 20,
  },
  opcion: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  opcionTexto: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelar: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelarTexto: {
    color: '#777',
    fontSize: 14,
  },
});
