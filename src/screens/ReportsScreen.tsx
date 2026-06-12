import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  TouchableOpacity, Share, Alert, ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { Colors, R, F, S } from '../theme/colors';

interface BarProps { label: string; value: number; max: number; color: string; }
function Bar({ label, value, max, color }: BarProps) {
  const anim = useSharedValue(0);
  useEffect(() => { anim.value = withSpring(max > 0 ? value / max : 0, { damping: 18, stiffness: 80 }); }, [value, max]);
  const barStyle = useAnimatedStyle(() => ({ width: `${anim.value * 100}%` }));
  return (
    <View style={barStyles.row}>
      <Text style={barStyles.label} numberOfLines={1}>{label}</Text>
      <View style={barStyles.track}>
        <Animated.View style={[barStyles.fill, { backgroundColor: color }, barStyle]} />
      </View>
      <Text style={barStyles.value}>€{value.toFixed(0)}</Text>
    </View>
  );
}
const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  label: { width: 80, fontSize: F.caption, color: Colors.label3, fontWeight: F.medium },
  track: { flex: 1, height: 6, backgroundColor: Colors.bg4, borderRadius: R.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: R.full },
  value: { width: 50, fontSize: F.caption, color: Colors.label2, fontWeight: F.semibold, textAlign: 'right' },
});

export default function ReportsScreen({ navigation }: { navigation: any }) {
  const currentStand = useStore((s) => s.currentStand);
  const currentEvent = useStore((s) => s.currentEvent);

  if (!currentStand) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}><Text style={styles.emptyMsg}>Sin datos</Text></View>
    </SafeAreaView>
  );

  const txs = (currentStand.transactions ?? []);
  const commissionRate = currentEvent?.commissionRate ?? 0;
  const breakEven = (currentStand.standCost ?? 0) + (currentStand.inventoryCost ?? 0);
  const grossRevenue = txs.reduce((s, t) => s + t.salePrice * (t.quantity ?? 1), 0);
  const netRevenue = grossRevenue * (1 - commissionRate);
  const totalCost = txs.reduce((s, t) => s + t.costPrice * (t.quantity ?? 1), 0);
  const totalDiscount = txs.reduce((s, t) => s + (t.discount ?? 0), 0);
  const netProfit = netRevenue - totalCost - breakEven;
  const txCount = txs.length;

  // Per-product stats
  const byProduct: Record<string, { revenue: number; count: number; emoji: string }> = {};
  for (const t of txs) {
    const k = t.productName;
    if (!byProduct[k]) byProduct[k] = { revenue: 0, count: 0, emoji: '🛍️' };
    byProduct[k].revenue += t.salePrice * (t.quantity ?? 1);
    byProduct[k].count += 1;
  }
  const productList = Object.entries(byProduct).sort((a, b) => b[1].revenue - a[1].revenue);
  const maxRevenue = productList[0]?.[1]?.revenue ?? 1;

  const exportCSV = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const header = 'Fecha,Hora,Producto,Precio Original,Precio Venta,Descuento,Coste,Margen\n';
    const rows = txs.map(t => {
      const d = new Date(t.timestamp);
      return [
        d.toLocaleDateString('es-ES'),
        d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        `"${t.productName}"`,
        t.originalPrice?.toFixed(2) ?? t.salePrice.toFixed(2),
        t.salePrice.toFixed(2),
        (t.discount ?? 0).toFixed(2),
        t.costPrice.toFixed(2),
        t.netMargin?.toFixed(2) ?? '0.00',
      ].join(',');
    }).join('\n');
    Share.share({ message: header + rows, title: `Reporte - ${currentStand.name}` });
  };

  const palette = [Colors.primary, Colors.blue, Colors.green, Colors.orange, Colors.teal];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg0} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={Colors.label2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportes</Text>
        <TouchableOpacity onPress={exportCSV} style={styles.exportBtn}>
          <Ionicons name="download-outline" size={18} color={Colors.primary} />
          <Text style={styles.exportLabel}>CSV</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* KPI row */}
        <View style={styles.kpiRow}>
          {[
            { label: 'Ingresos brutos', value: `€${grossRevenue.toFixed(2)}`, color: Colors.label1, icon: '💰' },
            { label: 'Ingresos netos', value: `€${netRevenue.toFixed(2)}`, color: Colors.blue, icon: '✅' },
            { label: 'Beneficio neto', value: `${netProfit >= 0 ? '+' : ''}€${netProfit.toFixed(2)}`, color: netProfit >= 0 ? Colors.green : Colors.red, icon: netProfit >= 0 ? '📈' : '📉' },
          ].map((kpi, i) => (
            <Animated.View key={kpi.label} entering={FadeInDown.delay(i * 60).duration(400).springify()} style={styles.kpiCard}>
              <Text style={{ fontSize: 22 }}>{kpi.icon}</Text>
              <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Secondary metrics */}
        <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.metaCard}>
          <MetaRow icon="receipt-outline" label="Total ventas" value={`${txCount}`} />
          <View style={styles.metaSep} />
          <MetaRow icon="ticket-outline" label="Ticket medio" value={txCount > 0 ? `€${(grossRevenue / txCount).toFixed(2)}` : '—'} />
          <View style={styles.metaSep} />
          <MetaRow icon="pricetag-outline" label="Total descuentos" value={`€${totalDiscount.toFixed(2)}`} color={Colors.orange} />
          <View style={styles.metaSep} />
          <MetaRow icon="storefront-outline" label="Comisión festival" value={`€${(grossRevenue * commissionRate).toFixed(2)}`} color={Colors.red} />
        </Animated.View>

        {/* Revenue by product */}
        {productList.length > 0 && (
          <Animated.View entering={FadeInDown.delay(240).duration(400)} style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Ingresos por producto</Text>
            {productList.slice(0, 8).map(([name, data], i) => (
              <Bar key={name} label={name} value={data.revenue} max={maxRevenue} color={palette[i % palette.length]} />
            ))}
          </Animated.View>
        )}

        {/* Transaction list */}
        {txs.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.txCard}>
            <Text style={styles.sectionTitle}>Historial completo</Text>
            {[...txs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((tx, i) => (
              <View key={tx.id} style={[styles.txRow, i < txs.length - 1 && styles.txBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txName}>{tx.productName}</Text>
                  <Text style={styles.txTime}>{new Date(tx.timestamp).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {(tx.discount ?? 0) > 0 && <Text style={styles.txDiscount}>-€{(tx.discount ?? 0).toFixed(2)}</Text>}
                  <Text style={styles.txPrice}>€{tx.salePrice.toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaRow({ icon, label, value, color = Colors.label1 }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <View style={styles.metaRow}>
      <Ionicons name={icon} size={16} color={Colors.label3} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={[styles.metaValue, { color }]}>{value}</Text>
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
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primarySoft, borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 6 },
  exportLabel: { fontSize: F.caption, fontWeight: F.bold, color: Colors.primary },

  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  kpiCard: { flex: 1, backgroundColor: Colors.bg2, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.sep, padding: 14, alignItems: 'center', gap: 4 },
  kpiValue: { fontSize: F.sub, fontWeight: F.bold, letterSpacing: -0.2 },
  kpiLabel: { fontSize: F.micro, color: Colors.label4, textAlign: 'center' },

  metaCard: { backgroundColor: Colors.bg2, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.sep, overflow: 'hidden', marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  metaLabel: { flex: 1, fontSize: F.sub, color: Colors.label2 },
  metaValue: { fontSize: F.sub, fontWeight: F.semibold },
  metaSep: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.sep },

  chartCard: { backgroundColor: Colors.bg2, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.sep, padding: 18, marginBottom: 12 },
  sectionTitle: { fontSize: F.caption, fontWeight: F.semibold, color: Colors.label3, marginBottom: 14, letterSpacing: 0.5, textTransform: 'uppercase' },

  txCard: { backgroundColor: Colors.bg2, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.sep, overflow: 'hidden' },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  txBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.sep },
  txName: { fontSize: F.sub, fontWeight: F.medium, color: Colors.label1 },
  txTime: { fontSize: F.caption, color: Colors.label4, marginTop: 1 },
  txDiscount: { fontSize: F.micro, color: Colors.orange },
  txPrice: { fontSize: F.body, fontWeight: F.semibold, color: Colors.label1 },
});
