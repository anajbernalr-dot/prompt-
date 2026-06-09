import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { useStore, Product } from '../store/useStore';
import { ProductButton } from '../components/ProductButton';
import { RadialMenu } from '../components/RadialMenu';
import { formatCurrency } from '../utils/calculations';

type Props = { navigation: any };

export default function QuickTapScreen({ navigation }: Props) {
  const currentStand = useStore((s) => s.currentStand);
  const registerSale = useStore((s) => s.registerSale);
  const registerComboSale = useStore((s) => s.registerComboSale);

  const [radialVisible, setRadialVisible] = useState(false);
  const [radialProduct, setRadialProduct] = useState<Product | null>(null);
  const [radialX, setRadialX] = useState(0);
  const [radialY, setRadialY] = useState(0);

  const [comboMode, setComboMode] = useState(false);
  const [comboItems, setComboItems] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [comboPrice, setComboPrice] = useState('');
  const [showComboModal, setShowComboModal] = useState(false);

  const flashAnim = useRef(new Animated.Value(0)).current;
  const [flashText, setFlashText] = useState('');

  const products = currentStand?.products ?? [];

  const showFlash = (msg: string) => {
    setFlashText(msg);
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const handleProductPress = (product: Product) => {
    if (product.stock === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (comboMode) {
      toggleComboItem(product);
      return;
    }
    registerSale({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      originalPrice: product.price,
      salePrice: product.price,
      discount: 0,
      costPrice: product.costPrice,
      isCombo: false,
    });
    showFlash(`${product.emoji} ${product.name} — ${formatCurrency(product.price)}`);
  };

  const handleProductLongPress = (product: Product, pageX: number, pageY: number) => {
    if (product.stock === 0) return;
    setRadialProduct(product);
    setRadialX(pageX);
    setRadialY(pageY);
    setRadialVisible(true);
  };

  const handleRadialSelect = (option: string, customPrice?: number) => {
    if (!radialProduct) return;
    let salePrice = radialProduct.price;
    let discount = 0;

    if (option === 'discount_10') {
      discount = 10;
      salePrice = radialProduct.price * 0.9;
    } else if (option === 'discount_20') {
      discount = 20;
      salePrice = radialProduct.price * 0.8;
    } else if (option === 'custom' && customPrice != null) {
      salePrice = customPrice;
      discount = Math.round(((radialProduct.price - customPrice) / radialProduct.price) * 100);
    }

    registerSale({
      productId: radialProduct.id,
      productName: radialProduct.name,
      quantity: 1,
      originalPrice: radialProduct.price,
      salePrice,
      discount,
      costPrice: radialProduct.costPrice,
      isCombo: false,
    });
    showFlash(
      `${radialProduct.emoji} ${radialProduct.name}${discount > 0 ? ` (-${discount}%)` : ''} — ${formatCurrency(salePrice)}`
    );
  };

  const toggleComboItem = (product: Product) => {
    setComboItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.filter((i) => i.product.id !== product.id);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const isInCombo = (product: Product) => comboItems.some((i) => i.product.id === product.id);

  const handleAddToCombo = (product: Product) => {
    setComboMode(true);
    toggleComboItem(product);
  };

  const handleConfirmCombo = () => {
    const price = parseFloat(comboPrice.replace(',', '.'));
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Ingresa un precio válido para el combo.');
      return;
    }
    if (comboItems.length < 2) {
      Alert.alert('Error', 'Un combo necesita al menos 2 productos.');
      return;
    }
    registerComboSale(comboItems, price);
    showFlash(`Combo x${comboItems.length} — ${formatCurrency(price)}`);
    setComboMode(false);
    setComboItems([]);
    setComboPrice('');
    setShowComboModal(false);
  };

  const cancelCombo = () => {
    setComboMode(false);
    setComboItems([]);
    setComboPrice('');
  };

  const comboTotal = comboItems.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar Venta</Text>
        {comboMode ? (
          <TouchableOpacity onPress={cancelCombo}>
            <Text style={styles.cancelComboText}>Cancelar</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {comboMode && (
        <View style={styles.comboBanner}>
          <Text style={styles.comboBannerText}>
            Modo Combo — {comboItems.length} producto{comboItems.length !== 1 ? 's' : ''} seleccionado{comboItems.length !== 1 ? 's' : ''}
          </Text>
          {comboItems.length >= 2 && (
            <TouchableOpacity
              style={styles.comboProceed}
              onPress={() => setShowComboModal(true)}
            >
              <Text style={styles.comboProceedText}>Fijar precio</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.text} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <Animated.View
        style={[styles.flashOverlay, { opacity: flashAnim }]}
        pointerEvents="none"
      >
        <View style={styles.flashCard}>
          <Ionicons name="checkmark-circle" size={22} color={Colors.accent} />
          <Text style={styles.flashText}>{flashText}</Text>
        </View>
      </Animated.View>

      {products.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No hay productos configurados</Text>
          <TouchableOpacity
            style={styles.setupButton}
            onPress={() => navigation.navigate('StandSetup')}
          >
            <Text style={styles.setupButtonText}>Agregar Productos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <ProductButton
              product={item}
              onPress={handleProductPress}
              onLongPress={handleProductLongPress}
              inCombo={isInCombo(item)}
            />
          )}
        />
      )}

      <RadialMenu
        visible={radialVisible}
        product={radialProduct}
        anchorX={radialX}
        anchorY={radialY}
        onSelect={handleRadialSelect}
        onClose={() => setRadialVisible(false)}
        onAddToCombo={handleAddToCombo}
      />

      <Modal visible={showComboModal} transparent animationType="slide">
        <View style={styles.comboModalOverlay}>
          <View style={styles.comboModal}>
            <Text style={styles.comboModalTitle}>Precio del Combo</Text>
            <View style={styles.comboItemsList}>
              {comboItems.map((item) => (
                <View key={item.product.id} style={styles.comboItemRow}>
                  <Text style={styles.comboItemEmoji}>{item.product.emoji}</Text>
                  <Text style={styles.comboItemName}>{item.product.name}</Text>
                  <Text style={styles.comboItemPrice}>{formatCurrency(item.product.price)}</Text>
                </View>
              ))}
              <View style={styles.comboTotal}>
                <Text style={styles.comboTotalLabel}>Total original</Text>
                <Text style={styles.comboTotalValue}>{formatCurrency(comboTotal)}</Text>
              </View>
            </View>
            <Text style={styles.comboInputLabel}>Precio del bundle $</Text>
            <TextInput
              style={styles.comboInput}
              value={comboPrice}
              onChangeText={setComboPrice}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={Colors.subtext}
              autoFocus
            />
            <View style={styles.comboActions}>
              <TouchableOpacity
                style={styles.comboCancelBtn}
                onPress={() => setShowComboModal(false)}
              >
                <Text style={styles.comboCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.comboConfirmBtn} onPress={handleConfirmCombo}>
                <Ionicons name="checkmark" size={18} color={Colors.background} />
                <Text style={styles.comboConfirmText}>Registrar Combo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  cancelComboText: { color: Colors.danger, fontSize: 14, fontWeight: '600' },
  comboBanner: {
    backgroundColor: Colors.primary + '22',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary + '44',
  },
  comboBannerText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  comboProceed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  comboProceedText: { color: Colors.text, fontSize: 12, fontWeight: '700' },
  flashOverlay: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
  },
  flashCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.accent + '55',
  },
  flashText: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  grid: { padding: 8 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 56 },
  emptyText: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  setupButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  setupButtonText: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  comboModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  comboModal: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  comboModalTitle: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: 16 },
  comboItemsList: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  comboItemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  comboItemEmoji: { fontSize: 20 },
  comboItemName: { color: Colors.text, fontSize: 14, flex: 1 },
  comboItemPrice: { color: Colors.subtext, fontSize: 13 },
  comboTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  comboTotalLabel: { color: Colors.subtext, fontSize: 13 },
  comboTotalValue: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  comboInputLabel: { color: Colors.subtext, fontSize: 13, marginBottom: 8, fontWeight: '500' },
  comboInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginBottom: 16,
  },
  comboActions: { flexDirection: 'row', gap: 12 },
  comboCancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  comboCancelText: { color: Colors.subtext, fontWeight: '600' },
  comboConfirmBtn: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  comboConfirmText: { color: Colors.background, fontWeight: '800', fontSize: 15 },
});
