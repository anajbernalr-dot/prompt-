import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Product } from '../store/useStore';
import { formatCurrency } from '../utils/calculations';

interface RadialOption {
  label: string;
  value: string;
  color?: string;
}

interface Props {
  visible: boolean;
  product: Product | null;
  anchorX: number;
  anchorY: number;
  onSelect: (option: string, customPrice?: number) => void;
  onClose: () => void;
  onAddToCombo: (product: Product) => void;
}

const OPTIONS: RadialOption[] = [
  { label: '-10%', value: 'discount_10', color: Colors.warning },
  { label: '-20%', value: 'discount_20', color: Colors.danger },
  { label: 'Precio\nPersonal.', value: 'custom', color: Colors.primary },
  { label: 'Agregar\nal Combo', value: 'combo', color: Colors.accent },
];

export function RadialMenu({ visible, product, anchorX, anchorY, onSelect, onClose, onAddToCombo }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPrice, setCustomPrice] = useState('');

  useEffect(() => {
    if (visible) {
      setShowCustomInput(false);
      setCustomPrice('');
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 14,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleOption = (option: RadialOption) => {
    if (option.value === 'custom') {
      setShowCustomInput(true);
      return;
    }
    if (option.value === 'combo' && product) {
      onAddToCombo(product);
      onClose();
      return;
    }
    onSelect(option.value);
    onClose();
  };

  const handleCustomConfirm = () => {
    const price = parseFloat(customPrice.replace(',', '.'));
    if (!isNaN(price) && price > 0) {
      onSelect('custom', price);
      onClose();
    }
  };

  if (!product) return null;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[
            styles.menuContainer,
            { transform: [{ scale: scaleAnim }] },
            {
              left: Math.min(anchorX - 100, 250),
              top: Math.min(anchorY - 80, 500),
            },
          ]}
        >
          {!showCustomInput ? (
            <>
              <View style={styles.productHeader}>
                <Text style={styles.productEmoji}>{product.emoji}</Text>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
              </View>
              <View style={styles.optionsGrid}>
                {OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.option, { borderColor: opt.color ?? Colors.border }]}
                    onPress={() => handleOption(opt)}
                  >
                    <Text style={[styles.optionLabel, { color: opt.color ?? Colors.text }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <Text style={styles.customTitle}>Precio personalizado</Text>
              <Text style={styles.customSubtitle}>Precio original: {formatCurrency(product.price)}</Text>
              <TextInput
                style={styles.customInput}
                value={customPrice}
                onChangeText={setCustomPrice}
                placeholder="0.00"
                placeholderTextColor={Colors.subtext}
                keyboardType="decimal-pad"
                autoFocus
              />
              <View style={styles.customButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCustomInput(false)}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleCustomConfirm}>
                  <Text style={styles.confirmBtnText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: Colors.cardElevated,
    borderRadius: 16,
    padding: 14,
    width: 220,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  productHeader: {
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  productEmoji: {
    fontSize: 28,
  },
  productName: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 14,
    marginTop: 4,
  },
  productPrice: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    width: '47%',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  customTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  customSubtitle: {
    color: Colors.subtext,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  customInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 12,
  },
  customButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: Colors.subtext,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: Colors.text,
    fontWeight: '700',
  },
});
