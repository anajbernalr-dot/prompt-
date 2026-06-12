import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { Colors, R, F, S } from '../theme/colors';

export default function PanicModeScreen({ navigation }: { navigation: any }) {
  const currentStand = useStore((s) => s.currentStand);
  const currentEvent = useStore((s) => s.currentEvent);
  const [panicData, setPanicData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liquidMode, setLiquidMode] = useState(false);

  useEffect(() => {
    computePanic();
  }, []);

  const computePanic = () => {
    setLoading(true);
    if (!currentStand) { setLoading(false); return; }
    const txs = currentStand.transactions ?? [];
    const commissionRate = currentEvent?.commissionRate ?? 0.2;
    const breakEven = (currentStand.standCost ?? 0) + (currentStand.inventoryCost ?? 0);
    const grossRevenue = txs.reduce((s: number, t: any) => s + t.salePrice * (t.quantity ?? 1), 0);
    const netRevenue = grossRevenue * (1 - commissionRate);
    const totalCost = txs.reduce((s: number, t: any) => s + t.costPrice * (t.quantity ?? 1), 0);
    const netProfit = netRevenue - totalCost - breakEven;
    const breakEvenRemaining = Math.max(breakEven - netRevenue, 0);
    const progress = breakEven > 0 ? (netRevenue / breakEven) * 100 : 100;

    const products = (currentStand.products ?? []).filter((p: any) => (p.stock ?? 0) > 0 || p.stock === undefined);
    const totalStock = products.reduce((s: number, p: any) => s + (p.stock ?? 10), 0) || 1;

    const recommendations = products.map((p: any) => {
      const cost = p.costPrice ?? p.cost_price ?? 0;
      const floor = commissionRate < 1 ? cost / (1 - commissionRate) : cost;
      const floorRounded = Math.ceil(floor * 100) / 100;
      const canDiscount = (p.price ?? 0) > floorRounded;
      const maxDiscountPct = canDiscount ? Math.floor(((p.price - floorRounded) / p.price) * 100) : 0;
      return { ...p, floorPrice: floorRounded, canDiscount, maxDiscountPct, urgency: progress < 50 ? 'critical' : progress < 100 ? 'warning' : 'safe' };
    });

    setPanicData({ netRevenue, breakEven, breakEvenRemaining, netProfit, progress, recommendations });
    setLoading(false);
  };

  if (loading) return <SafeAreaView style={styles.safe}><View style={styles.center}><ActivityIndicator color={Colors.primary} /></View></SafeAreaView>;

  if (!panicData) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}><Text style={styles.emptyMsg}>Sin datos de puesto</Text></View>
    </SafeAreaView>
  );

  const { netRevenue, breakEven, breakEvenRemaining, netProfit, progress, recommendations } = panicData;
  const statusColor = progress >= 100 ? Colors.green : progress >= 50 ? Colors.orange : Colors.red;
  const statusLabel = progress >= 100 ? 'Objetivo superado 🎉' : progress >= 50 ? 'En progreso' : '⚠️ Crítico';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg0} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={Colors.label2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modo Panic</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Status card */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={[styles.statusCard, { borderColor: statusColor + '40' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusLabel}>{statusLabel}</Text>
            <Text style={styles.statusSub}>Break-even al {Math.round(progress)}%</Text>
          </View>
          <View style={styles.statusPct}>
            <Text style={[styles.statusPctValue, { color: statusColor }]}>{Math.round(progress)}%</Text>
          </View>
        </Animated.View>

        {/* Key numbers */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.numbersCard}>
          <NumberRow label="Ingresos netos actuales" value={`€${netRevenue.toFixed(2)}`} color={Colors.blue} />
          <View style={styles.sep} />
          <NumberRow label="Break-even necesario" value={`€${breakEven.toFixed(2)}`} color={Colors.label2} />
          <View style={styles.sep} />
          <NumberRow label="Pendiente para cubrir" value={breakEvenRemaining > 0 ? `€${breakEvenRemaining.toFixed(2)}` : '✅ Cubierto'} color={breakEvenRemaining > 0 ? Colors.orange : Colors.green} />
          <View style={styles.sep} />
          <NumberRow label="Beneficio / Pérdida neta" value={`${netProfit >= 0 ? '+' : ''}€${netProfit.toFixed(2)}`} color={netProfit >= 0 ? Colors.green : Colors.red} />
        </Animated.View>

        {/* Liquidation toggle */}
        <Animated.View entering={FadeInDown.delay(140).duration(400)} style={styles.liquidCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.liquidTitle}>Modo liquidación</Text>
            <Text style={styles.liquidSub}>Muestra el precio suelo financiero por producto</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, liquidMode && styles.toggleOn]}
            onPress={() => { setLiquidMode(v => !v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
            <View style={[styles.toggleThumb, liquidMode && styles.toggleThumbOn]} />
          </TouchableOpacity>
        </Animated.View>

        {/* Product recommendations */}
        {recommendations.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text style={styles.sectionTitle}>Precios estratégicos</Text>
            <View style={styles.productsCard}>
              {recommendations.map((p: any, i: number) => {
                const urgencyColor = p.urgency === 'critical' ? Colors.red : p.urgency === 'warning' ? Colors.orange : Colors.green;
                return (
                  <View key={p.id} style={[styles.productRow, i < recommendations.length - 1 && styles.rowBorder]}>
                    <Text style={styles.productEmoji}>{p.emoji ?? '🛍️'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName}>{p.name}</Text>
                      <Text style={styles.productNormal}>Precio normal: €{p.price?.toFixed(2)}</Text>
                    </View>
                    <View style={styles.productPrices}>
                      {liquidMode && (
                        <View style={[styles.floorPill, { backgroundColor: urgencyColor + '18' }]}>
                          <Text style={[styles.floorLabel, { color: urgencyColor }]}>Suelo €{p.floorPrice?.toFixed(2)}</Text>
                        </View>
                      )}
                      {p.canDiscount && (
                        <Text style={styles.discountMax}>Máx -{p.maxDiscountPct}%</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(280).duration(400)} style={styles.tip}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            El precio suelo es el mínimo para cubrir el coste del producto con la comisión del festival descontada. Nunca bajes de ahí.
          </Text>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

function NumberRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.numberRow}>
      <Text style={styles.numberLabel}>{label}</Text>
      <Text style={[styles.numberValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyMsg: { fontSize: F.body, color: Colors.label3 },
  scroll: { padding: S.xl, paddingBottom: 48 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.xl, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.sep },
  headerTitle: { fontSize: F.headline, fontWeight: F.bold, color: Colors.label1 },

  statusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg2, borderRadius: R.lg, borderWidth: 1, padding: 18, marginBottom: 12, gap: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontSize: F.callout, fontWeight: F.bold, color: Colors.label1 },
  statusSub: { fontSize: F.footnote, color: Colors.label3, marginTop: 2 },
  statusPct: {},
  statusPctValue: { fontSize: F.title2, fontWeight: F.black, letterSpacing: -0.5 },

  numbersCard: { backgroundColor: Colors.bg2, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.sep, marginBottom: 12, overflow: 'hidden' },
  numberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  numberLabel: { fontSize: F.sub, color: Colors.label3, flex: 1 },
  numberValue: { fontSize: F.body, fontWeight: F.bold },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.sep },

  liquidCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg2, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.sep, padding: 18, marginBottom: 20, gap: 16 },
  liquidTitle: { fontSize: F.callout, fontWeight: F.semibold, color: Colors.label1 },
  liquidSub: { fontSize: F.caption, color: Colors.label3, marginTop: 2 },
  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: Colors.bg4, justifyContent: 'center', padding: 2 },
  toggleOn: { backgroundColor: Colors.green },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.label3 },
  toggleThumbOn: { backgroundColor: '#fff', transform: [{ translateX: 20 }] },

  sectionTitle: { fontSize: F.footnote, fontWeight: F.semibold, color: Colors.label3, marginBottom: 10, letterSpacing: 0.5, textTransform: 'uppercase' },
  productsCard: { backgroundColor: Colors.bg2, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.sep, overflow: 'hidden', marginBottom: 20 },
  productRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.sep },
  productEmoji: { fontSize: 28 },
  productName: { fontSize: F.sub, fontWeight: F.semibold, color: Colors.label1 },
  productNormal: { fontSize: F.caption, color: Colors.label4, marginTop: 1 },
  productPrices: { alignItems: 'flex-end', gap: 4 },
  floorPill: { borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 3 },
  floorLabel: { fontSize: F.caption, fontWeight: F.bold },
  discountMax: { fontSize: F.micro, color: Colors.label4 },

  tip: { flexDirection: 'row', gap: 12, backgroundColor: Colors.blueSoft, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: Colors.blue + '30' },
  tipIcon: { fontSize: 20 },
  tipText: { flex: 1, fontSize: F.footnote, color: Colors.blue, lineHeight: 20 },
});
