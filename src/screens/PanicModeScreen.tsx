import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useStore } from '../store/useStore';
import {
  calculateBreakEven,
  calculateGrossRevenue,
  calculateNetRevenue,
  calculateTotalCOGS,
  calculateNetProfit,
  calculateBreakEvenProgress,
  calculateRemainingBreakEven,
  calculateFloorPrice,
  calculateTotalStock,
  getMotivationalMessage,
  formatCurrency,
} from '../utils/calculations';

type Props = { navigation: any };

export default function PanicModeScreen({ navigation }: Props) {
  const currentStand = useStore((s) => s.currentStand);
  const currentEvent = useStore((s) => s.currentEvent);
  const [liquidationMode, setLiquidationMode] = useState(false);

  const commissionRate = currentEvent?.commissionRate ?? 0;

  const data = useMemo(() => {
    if (!currentStand) return null;
    const gross = calculateGrossRevenue(currentStand.transactions);
    const net = calculateNetRevenue(gross, commissionRate);
    const cogs = calculateTotalCOGS(currentStand.transactions);
    const profit = calculateNetProfit(net, cogs);
    const progress = calculateBreakEvenProgress(currentStand, commissionRate);
    const remaining = calculateRemainingBreakEven(currentStand, commissionRate);
    const totalStock = calculateTotalStock(currentStand);
    const breakEven = calculateBreakEven(currentStand);

    const productStrategies = currentStand.products
      .filter((p) => p.stock > 0)
      .map((p) => {
        const floorPrice = calculateFloorPrice(p, remaining, totalStock);
        const currentMargin = ((p.price - p.costPrice) / p.price) * 100;
        const floorMargin = floorPrice > 0 ? ((floorPrice - p.costPrice) / floorPrice) * 100 : 0;
        const urgency =
          currentMargin < 10
            ? 'high'
            : currentMargin < 25
            ? 'medium'
            : 'low';
        const liqPrice = Math.max(p.costPrice * 1.05, floorPrice * 0.85);

        return {
          product: p,
          floorPrice,
          currentMargin,
          floorMargin,
          urgency,
          liqPrice,
          projectedRevenue: liqPrice * p.stock,
        };
      })
      .sort((a, b) => a.urgency.localeCompare(b.urgency) || b.projectedRevenue - a.projectedRevenue);

    return { gross, net, cogs, profit, progress, remaining, totalStock, breakEven, productStrategies };
  }, [currentStand, commissionRate]);

  if (!currentStand || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🆘</Text>
          <Text style={styles.emptyText}>No hay puesto configurado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const urgencyColor = (u: string) => {
    if (u === 'high') return Colors.danger;
    if (u === 'medium') return Colors.warning;
    return Colors.accent;
  };

  const urgencyLabel = (u: string) => {
    if (u === 'high') return 'URGENTE';
    if (u === 'medium') return 'PRIORIDAD';
    return 'ESTABLE';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="warning" size={18} color={Colors.danger} />
          <Text style={styles.headerTitle}>Modo Pánico</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Overview */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Estado Actual</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: data.progress >= 1 ? Colors.accent + '33' : Colors.danger + '33' },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: data.progress >= 1 ? Colors.accent : Colors.danger },
                ]}
              >
                {data.progress >= 1 ? '✓ EN GANANCIA' : '⚠ EN PÉRDIDA'}
              </Text>
            </View>
          </View>

          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Punto de Equilibrio</Text>
              <Text style={styles.statusValue}>{formatCurrency(data.breakEven)}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Ganancia Actual</Text>
              <Text style={[styles.statusValue, { color: data.profit >= 0 ? Colors.accent : Colors.danger }]}>
                {formatCurrency(data.profit)}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Falta para PE</Text>
              <Text style={[styles.statusValue, { color: Colors.warning }]}>
                {data.remaining > 0 ? formatCurrency(data.remaining) : '¡Logrado!'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Stock Restante</Text>
              <Text style={styles.statusValue}>{data.totalStock} uds.</Text>
            </View>
          </View>
        </View>

        {/* Motivational */}
        <View style={styles.motivationalCard}>
          <Ionicons name="bulb-outline" size={20} color={Colors.warning} />
          <Text style={styles.motivationalText}>{getMotivationalMessage(data.progress)}</Text>
        </View>

        {/* Liquidation Toggle */}
        <View style={styles.liquidationToggle}>
          <View>
            <Text style={styles.liquidationTitle}>Modo Liquidación</Text>
            <Text style={styles.liquidationSubtitle}>
              Muestra precios mínimos recomendados para recuperar la inversión
            </Text>
          </View>
          <Switch
            value={liquidationMode}
            onValueChange={setLiquidationMode}
            trackColor={{ false: Colors.border, true: Colors.danger + '99' }}
            thumbColor={liquidationMode ? Colors.danger : Colors.subtext}
          />
        </View>

        {/* Product Strategies */}
        <Text style={styles.sectionTitle}>Estrategia por Producto</Text>
        {data.productStrategies.map(({ product, floorPrice, currentMargin, urgency, liqPrice }) => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productHeader}>
              <Text style={styles.productEmoji}>{product.emoji}</Text>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productStock}>Stock: {product.stock} uds.</Text>
              </View>
              <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor(urgency) + '33' }]}>
                <Text style={[styles.urgencyText, { color: urgencyColor(urgency) }]}>
                  {urgencyLabel(urgency)}
                </Text>
              </View>
            </View>

            <View style={styles.pricesRow}>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Precio Actual</Text>
                <Text style={styles.priceValue}>{formatCurrency(product.price)}</Text>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Precio Piso</Text>
                <Text style={[styles.priceValue, { color: Colors.warning }]}>
                  {formatCurrency(floorPrice)}
                </Text>
              </View>
              {liquidationMode && (
                <>
                  <View style={styles.priceDivider} />
                  <View style={styles.priceItem}>
                    <Text style={styles.priceLabel}>Liquidación</Text>
                    <Text style={[styles.priceValue, { color: Colors.danger }]}>
                      {formatCurrency(liqPrice)}
                    </Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.marginBar}>
              <Text style={styles.marginLabel}>
                Margen: {currentMargin.toFixed(1)}%
              </Text>
              <View style={styles.marginTrack}>
                <View
                  style={[
                    styles.marginFill,
                    {
                      width: `${Math.min(100, Math.max(0, currentMargin))}%`,
                      backgroundColor: urgencyColor(urgency),
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        ))}

        {data.productStrategies.length === 0 && (
          <View style={styles.noProductsState}>
            <Text style={styles.noProductsText}>No hay productos con stock disponible</Text>
          </View>
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  scrollContent: { padding: 16, gap: 12 },
  statusCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.danger + '44',
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  statusTitle: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statusItem: { width: '45%' },
  statusLabel: { color: Colors.subtext, fontSize: 11, marginBottom: 2 },
  statusValue: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  motivationalCard: {
    backgroundColor: Colors.warning + '11',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.warning + '33',
    alignItems: 'flex-start',
  },
  motivationalText: { color: Colors.text, fontSize: 14, flex: 1, lineHeight: 20 },
  liquidationToggle: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  liquidationTitle: { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  liquidationSubtitle: { color: Colors.subtext, fontSize: 12, maxWidth: '85%', lineHeight: 16 },
  sectionTitle: {
    color: Colors.subtext,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  productCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  productHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  productEmoji: { fontSize: 26 },
  productInfo: { flex: 1 },
  productName: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  productStock: { color: Colors.subtext, fontSize: 12, marginTop: 2 },
  urgencyBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  urgencyText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  pricesRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 10,
  },
  priceItem: { flex: 1, alignItems: 'center' },
  priceDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 8 },
  priceLabel: { color: Colors.subtext, fontSize: 10, marginBottom: 4, textAlign: 'center' },
  priceValue: { color: Colors.text, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  marginBar: { gap: 4 },
  marginLabel: { color: Colors.subtext, fontSize: 11 },
  marginTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  marginFill: { height: '100%', borderRadius: 2 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 56 },
  emptyText: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  noProductsState: { alignItems: 'center', paddingVertical: 24 },
  noProductsText: { color: Colors.subtext, fontSize: 14 },
});
