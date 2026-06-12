import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  TextInput, Modal, TouchableOpacity, Dimensions, Alert,
} from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring, withTiming,
  withSequence, FadeIn, FadeInDown, interpolateColor, runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { Colors, R, F, S } from '../theme/colors';

const { width: W } = Dimensions.get('window');
const TILE_W = (W - 48 - 10) / 2;

// —— Product tile ——
function ProductTile({ product, onSale, onLongPress }: { product: any; onSale: (p: any) => void; onLongPress: (p: any) => void }) {
  const flash = useSharedValue(0);
  const scale = useSharedValue(1);

  const triggerSale = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    flash.value = withSequence(withTiming(1, { duration: 60 }), withTiming(0, { duration: 300 }));
    onSale(product);
  }, [product]);

  const triggerLong = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onLongPress(product);
  }, [product]);

  const gesture = Gesture.Simultaneous(
    Gesture.LongPress().minDuration(350)
      .onStart(() => { runOnJS(triggerLong)(); }),
    Gesture.Tap()
      .onBegin(() => { scale.value = withSpring(0.93, { damping: 14, stiffness: 500 }); })
      .onFinalize((_, ok) => {
        scale.value = withSpring(1, { damping: 12, stiffness: 300 });
        if (ok) runOnJS(triggerSale)();
      })
  );

  const tileStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(flash.value, [0, 1], [Colors.bg2, Colors.primaryMid]),
  }));

  const outOfStock = (product.stock ?? 0) === 0;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.tile, tileStyle, outOfStock && styles.tileOOS]}>
        <Text style={styles.tileEmoji}>{product.emoji ?? '🛍️'}</Text>
        <Text style={styles.tileName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.tilePrice}>€{(product.price ?? 0).toFixed(2)}</Text>
        {product.stock !== undefined && (
          <View style={[styles.stockPill, { backgroundColor: outOfStock ? Colors.redSoft : Colors.greenSoft }]}>
            <Text style={[styles.stockText, { color: outOfStock ? Colors.red : Colors.green }]}>
              {outOfStock ? 'Agotado' : `${product.stock} uds`}
            </Text>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

// —— Radial discount sheet ——
function DiscountSheet({ product, visible, onClose, onApply }: { product: any; visible: boolean; onClose: () => void; onApply: (price: number, desc: string) => void }) {
  const [customPrice, setCustomPrice] = useState('');
  if (!product) return null;

  const opts = [
    { label: '-10%', price: product.price * 0.9, color: Colors.orange },
    { label: '-20%', price: product.price * 0.8, color: Colors.red },
    { label: '-30%', price: product.price * 0.7, color: Colors.red },
    { label: 'Gratis', price: 0, color: Colors.label3 },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.sheetScrim} activeOpacity={1} onPress={onClose}>
        <Animated.View entering={FadeInDown.duration(280).springify()} style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetProduct}>{product.emoji} {product.name}</Text>
          <Text style={styles.sheetFull}>Precio normal: €{product.price?.toFixed(2)}</Text>

          <View style={styles.discountGrid}>
            {opts.map((o) => (
              <TouchableOpacity key={o.label} style={[styles.discountBtn, { borderColor: o.color + '40' }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onApply(o.price, o.label); onClose(); }}>
                <Text style={[styles.discountLabel, { color: o.color }]}>{o.label}</Text>
                <Text style={styles.discountPrice}>€{o.price.toFixed(2)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customRow}>
            <View style={styles.customInput}>
              <Text style={styles.customPrefix}>€</Text>
              <TextInput
                style={styles.customField}
                placeholder="Precio personalizado"
                placeholderTextColor={Colors.label4}
                keyboardType="decimal-pad"
                value={customPrice}
                onChangeText={setCustomPrice}
              />
            </View>
            <TouchableOpacity style={styles.customApply}
              onPress={() => {
                const p = parseFloat(customPrice);
                if (!isNaN(p) && p >= 0) { onApply(p, `€${p.toFixed(2)}`); onClose(); }
              }}>
              <Text style={styles.customApplyLabel}>OK</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

// —— Main screen ——
export default function QuickTapScreen({ navigation }: { navigation: any }) {
  const currentStand = useStore((s) => s.currentStand);
  const registerSale = useStore((s) => s.registerSale);
  const activeCashier = useStore((s) => s.activeCashier);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [lastSale, setLastSale] = useState<string | null>(null);
  const lastSaleAnim = useSharedValue(0);

  const products = (currentStand?.products ?? []).filter((p: any) => p.isActive !== false && p.is_active !== 0);

  const doSale = useCallback(async (product: any, salePrice?: number, discountDesc?: string) => {
    const price = salePrice ?? product.price;
    try {
      await registerSale({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        originalPrice: product.price,
        salePrice: price,
        discount: product.price - price,
        costPrice: product.costPrice ?? product.cost_price ?? 0,
        isCombo: false,
      });
      const label = discountDesc ? `${product.name} (${discountDesc})` : product.name;
      setLastSale(`✅ ${label} — €${price.toFixed(2)}`);
      lastSaleAnim.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 1800 }),
        withTiming(0, { duration: 400 })
      );
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }, [registerSale]);

  const toastStyle = useAnimatedStyle(() => ({
    opacity: lastSaleAnim.value,
    transform: [{ translateY: withTiming(lastSaleAnim.value === 0 ? 20 : 0, { duration: 200 }) }],
  }));

  if (!currentStand) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyCenter}>
          <Text style={styles.emptyIcon}>🏪</Text>
          <Text style={styles.emptyMsg}>Configura tu puesto primero</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg0} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={Colors.label2} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Registro rápido</Text>
          {activeCashier && <Text style={styles.headerSub}>🙋 {activeCashier.name}</Text>}
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Toast */}
      <Animated.View style={[styles.toast, toastStyle]} pointerEvents="none">
        <Text style={styles.toastText}>{lastSale}</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {products.length === 0 ? (
          <View style={styles.emptyCenter}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyMsg}>Sin productos. Añade desde Ajustes.</Text>
          </View>
        ) : (
          products.map((product: any) => (
            <ProductTile
              key={product.id}
              product={product}
              onSale={(p) => doSale(p)}
              onLongPress={(p) => { setSelectedProduct(p); setSheetVisible(true); }}
            />
          ))
        )}
      </ScrollView>

      <DiscountSheet
        product={selectedProduct}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onApply={(price, desc) => selectedProduct && doSale(selectedProduct, price, desc)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: S.xl, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.sep,
  },
  headerTitle: { fontSize: F.headline, fontWeight: F.bold, color: Colors.label1 },
  headerSub: { fontSize: F.caption, color: Colors.label3, marginTop: 1 },

  toast: {
    position: 'absolute', top: 90, left: 20, right: 20, zIndex: 99,
    backgroundColor: Colors.bg3, borderRadius: R.md, padding: 14,
    borderWidth: 1, borderColor: Colors.green + '40',
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12,
  },
  toastText: { fontSize: F.sub, fontWeight: F.medium, color: Colors.green, textAlign: 'center' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 14, gap: 10 },

  tile: {
    width: TILE_W, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.sep,
    padding: 16, alignItems: 'center', minHeight: 140, justifyContent: 'center', gap: 6,
  },
  tileOOS: { opacity: 0.45 },
  tileEmoji: { fontSize: 36 },
  tileName: { fontSize: F.sub, fontWeight: F.semibold, color: Colors.label1, textAlign: 'center' },
  tilePrice: { fontSize: F.body, fontWeight: F.bold, color: Colors.primary },
  stockPill: { borderRadius: R.full, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2 },
  stockText: { fontSize: F.micro, fontWeight: F.semibold },

  sheetScrim: { flex: 1, backgroundColor: Colors.scrim, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.bg2, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl,
    borderWidth: 1, borderColor: Colors.sep, padding: 24, paddingBottom: 40,
  },
  sheetHandle: { width: 36, height: 4, backgroundColor: Colors.sep, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetProduct: { fontSize: F.title3, fontWeight: F.bold, color: Colors.label1, marginBottom: 4 },
  sheetFull: { fontSize: F.footnote, color: Colors.label3, marginBottom: 20 },
  discountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  discountBtn: {
    flex: 1, minWidth: '44%', backgroundColor: Colors.bg3, borderRadius: R.md,
    borderWidth: 1, padding: 14, alignItems: 'center', gap: 4,
  },
  discountLabel: { fontSize: F.headline, fontWeight: F.bold },
  discountPrice: { fontSize: F.footnote, color: Colors.label3 },
  customRow: { flexDirection: 'row', gap: 10 },
  customInput: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg3, borderRadius: R.md, borderWidth: 1, borderColor: Colors.sep,
    paddingHorizontal: 14,
  },
  customPrefix: { fontSize: F.body, color: Colors.label3, marginRight: 4 },
  customField: { flex: 1, color: Colors.label1, fontSize: F.body, paddingVertical: 12 },
  customApply: { backgroundColor: Colors.primary, borderRadius: R.md, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  customApplyLabel: { fontSize: F.body, fontWeight: F.bold, color: '#fff' },

  emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12, minHeight: 300 },
  emptyIcon: { fontSize: 48 },
  emptyMsg: { fontSize: F.body, color: Colors.label3, textAlign: 'center' },
});
