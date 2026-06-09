import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useStore, Product } from '../store/useStore';

type Props = { navigation: any };

const EMOJI_OPTIONS = ['🍕','🌮','🍔','🍜','🧁','🍰','☕','🧃','🌯','🥗','🍦','🍩','🧆','🌽','🥤','🍺','🎂','🥞','🍟','🧀'];

const EMPTY_PRODUCT = {
  name: '',
  emoji: '🍕',
  price: '',
  costPrice: '',
  stock: '',
};

export default function StandSetupScreen({ navigation }: Props) {
  const setupStand = useStore((s) => s.setupStand);
  const addProduct = useStore((s) => s.addProduct);
  const currentStand = useStore((s) => s.currentStand);
  const currentEvent = useStore((s) => s.currentEvent);

  const [standName, setStandName] = useState('');
  const [standCost, setStandCost] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [product, setProduct] = useState({ ...EMPTY_PRODUCT });
  const [standReady, setStandReady] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const products = currentStand?.products ?? [];

  const handleStandSetup = () => {
    if (!standName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre de tu puesto.');
      return;
    }
    setupStand(standName.trim(), parseFloat(standCost) || 0);
    setStandReady(true);
  };

  const handleAddProduct = () => {
    if (!product.name.trim() || !product.price || !product.costPrice || !product.stock) {
      Alert.alert('Error', 'Completa todos los campos del producto.');
      return;
    }
    addProduct({
      name: product.name.trim(),
      emoji: product.emoji,
      price: parseFloat(product.price.replace(',', '.')),
      costPrice: parseFloat(product.costPrice.replace(',', '.')),
      stock: parseInt(product.stock),
    });
    setProduct({ ...EMPTY_PRODUCT });
    setShowProductForm(false);
  };

  const handleFinish = () => {
    if (products.length === 0) {
      Alert.alert('Sin productos', '¿Deseas continuar sin agregar productos?', [
        { text: 'Cancelar' },
        { text: 'Continuar', onPress: () => navigation.navigate('MainTabs') },
      ]);
      return;
    }
    navigation.navigate('MainTabs');
  };

  if (!standReady && !currentStand) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configurar Puesto</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Datos de tu Puesto</Text>
          {currentEvent && (
            <View style={styles.eventBadge}>
              <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
              <Text style={styles.eventBadgeText}>{currentEvent.name}</Text>
            </View>
          )}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nombre del Puesto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Tacos El Buen Sabor"
              placeholderTextColor={Colors.subtext}
              value={standName}
              onChangeText={setStandName}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Costo del Stand $ (renta)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.subtext}
              value={standCost}
              onChangeText={setStandCost}
              keyboardType="decimal-pad"
            />
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, !standName.trim() && styles.disabledButton]}
            onPress={handleStandSetup}
            disabled={!standName.trim()}
          >
            <Text style={styles.primaryButtonText}>Configurar y Agregar Productos</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>
          {currentStand?.name ?? standName}
        </Text>
        <TouchableOpacity onPress={handleFinish}>
          <Text style={styles.doneButton}>Listo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.productCountRow}>
          <Text style={styles.sectionTitle}>Productos ({products.length}/20)</Text>
          {products.length < 20 && (
            <TouchableOpacity onPress={() => setShowProductForm(!showProductForm)}>
              <Ionicons name={showProductForm ? 'close-circle' : 'add-circle'} size={26} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {showProductForm && (
          <View style={styles.productForm}>
            <Text style={styles.formTitle}>Nuevo Producto</Text>

            <View style={styles.emojiRow}>
              <TouchableOpacity
                style={styles.emojiButton}
                onPress={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Text style={styles.emojiPreview}>{product.emoji}</Text>
                <Ionicons name="chevron-down" size={14} color={Colors.subtext} />
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Nombre del producto"
                placeholderTextColor={Colors.subtext}
                value={product.name}
                onChangeText={(v) => setProduct({ ...product, name: v })}
              />
            </View>

            {showEmojiPicker && (
              <View style={styles.emojiGrid}>
                {EMOJI_OPTIONS.map((e) => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.emojiOption, product.emoji === e && styles.emojiOptionSelected]}
                    onPress={() => { setProduct({ ...product, emoji: e }); setShowEmojiPicker(false); }}
                  >
                    <Text style={styles.emojiOptionText}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Precio Venta $</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={Colors.subtext}
                  value={product.price}
                  onChangeText={(v) => setProduct({ ...product, price: v })}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ width: 10 }} />
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Costo $</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={Colors.subtext}
                  value={product.costPrice}
                  onChangeText={(v) => setProduct({ ...product, costPrice: v })}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ width: 10 }} />
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Stock</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={Colors.subtext}
                  value={product.stock}
                  onChangeText={(v) => setProduct({ ...product, stock: v })}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {product.price && product.costPrice && (
              <View style={styles.marginPreview}>
                <Ionicons name="trending-up-outline" size={14} color={Colors.accent} />
                <Text style={styles.marginPreviewText}>
                  Margen:{' '}
                  {(
                    ((parseFloat(product.price.replace(',', '.')) -
                      parseFloat(product.costPrice.replace(',', '.'))) /
                      parseFloat(product.price.replace(',', '.'))) *
                    100
                  ).toFixed(1)}
                  %
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.addProductButton} onPress={handleAddProduct}>
              <Ionicons name="add" size={18} color={Colors.text} />
              <Text style={styles.addProductButtonText}>Agregar Producto</Text>
            </TouchableOpacity>
          </View>
        )}

        {products.length === 0 && !showProductForm && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No hay productos aún</Text>
            <Text style={styles.emptySubtext}>Toca el + para agregar tu primer producto</Text>
          </View>
        )}

        {products.map((p) => (
          <View key={p.id} style={styles.productItem}>
            <Text style={styles.productEmoji}>{p.emoji}</Text>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{p.name}</Text>
              <Text style={styles.productMeta}>
                Venta: ${p.price.toFixed(2)} · Costo: ${p.costPrice.toFixed(2)} · Stock: {p.stock}
              </Text>
            </View>
            <Text style={styles.productMargin}>
              {(((p.price - p.costPrice) / p.price) * 100).toFixed(0)}%
            </Text>
          </View>
        ))}

        {products.length > 0 && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
            <Ionicons name="rocket-outline" size={18} color={Colors.text} />
            <Text style={styles.primaryButtonText}>¡Empezar a Vender!</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  doneButton: { color: Colors.primary, fontSize: 16, fontWeight: '700' },
  scrollContent: { padding: 16, gap: 4 },
  sectionTitle: {
    color: Colors.subtext,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '22',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  eventBadgeText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  fieldGroup: { marginBottom: 12 },
  label: { color: Colors.subtext, fontSize: 13, marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    color: Colors.text,
    fontSize: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: { flexDirection: 'row' },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  disabledButton: { opacity: 0.4 },
  primaryButtonText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  productCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  productForm: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
    marginBottom: 12,
    gap: 10,
  },
  formTitle: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  emojiRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  emojiButton: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    width: 52,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    gap: 2,
  },
  emojiPreview: { fontSize: 22 },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 10,
  },
  emojiOption: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  emojiOptionSelected: { backgroundColor: Colors.primary + '44', borderWidth: 1, borderColor: Colors.primary },
  emojiOptionText: { fontSize: 20 },
  marginPreview: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: Colors.accent + '11',
    borderRadius: 8,
    padding: 8,
  },
  marginPreviewText: { color: Colors.accent, fontSize: 13, fontWeight: '600' },
  addProductButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  addProductButtonText: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  emptySubtext: { color: Colors.subtext, fontSize: 14 },
  productItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  productEmoji: { fontSize: 26 },
  productInfo: { flex: 1 },
  productName: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  productMeta: { color: Colors.subtext, fontSize: 11, marginTop: 2 },
  productMargin: { color: Colors.accent, fontSize: 14, fontWeight: '700' },
});
