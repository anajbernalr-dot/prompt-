import React, { useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  StatusBar, RefreshControl, TouchableOpacity,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import BreakEvenBar from '../components/BreakEvenBar';
import { Colors, R, F, S } from '../theme/colors';

interface MetricTileProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon: string;
  delay?: number;
}

function MetricTile({ label, value, sub, color = Colors.label1, icon, delay = 0 }: MetricTileProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400).springify()} style={styles.tile}>
      <View style={[styles.tileIcon, { backgroundColor: color + '18' }]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text style={[styles.tileValue, { color }]}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
      {sub ? <Text style={styles.tileSub}>{sub}</Text> : null}
    </Animated.View>
  );
}

export default function DashboardScreen({ navigation }: { navigation: any }) {
  const currentStand = useStore((s) => s.currentStand);
  const currentEvent = useStore((s) => s.currentEvent);
  const refreshStandData = useStore((s) => s.refreshStandData);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshStandData?.();
    setRefreshing(false);
  }, []);

  if (!currentStand) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>🏪</Text>
          <Text style={styles.emptyTitle}>Sin puesto activo</Text>
          <Text style={styles.emptySub}>Únete a un evento o crea el tuyo</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Onboarding')}>
            <Text style={styles.emptyBtnLabel}>Empezar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const txs = currentStand.transactions ?? [];
  const commissionRate = currentEvent?.commissionRate ?? 0;
  const breakEven = (currentStand.standCost ?? 0) + (currentStand.inventoryCost ?? 0);

  const grossRevenue = txs.reduce((s, t) => s + t.salePrice * (t.quantity ?? 1), 0);
  const netRevenue = grossRevenue * (1 - commissionRate);
  const totalCost = txs.reduce((s, t) => s + t.costPrice * (t.quantity ?? 1), 0);
  const netProfit = netRevenue - totalCost - breakEven;
  const progress = breakEven > 0 ? (netRevenue / breakEven) * 100 : 100;
  const txCount = txs.length;
  const avgTicket = txCount > 0 ? grossRevenue / txCount : 0;

  const recentTxs = [...txs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 6);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg0} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View>
            <Text style={styles.headerSuper}>{currentEvent?.name ?? 'Evento'}</Text>
            <Text style={styles.headerTitle}>{currentStand.name}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={20} color={Colors.label3} />
          </TouchableOpacity>
        </Animated.View>

        {/* Break-even card */}
        <Animated.View entering={FadeInDown.delay(80).duration(400).springify()} style={styles.breakEvenCard}>
          <BreakEvenBar progress={progress} netRevenue={netRevenue} breakEven={breakEven} netProfit={netProfit} />
        </Animated.View>

        {/* Metrics grid */}
        <View style={styles.grid}>
          <MetricTile icon="💰" label="Ingresos brutos" value={`€${grossRevenue.toFixed(2)}`} color={Colors.label1} delay={100} />
          <MetricTile icon="✅" label="Ingr. netos" value={`€${netRevenue.toFixed(2)}`} sub={`-${(commissionRate * 100).toFixed(0)}% comisión`} color={Colors.blue} delay={140} />
          <MetricTile icon={netProfit >= 0 ? '📈' : '📉'} label="Beneficio neto" value={`${netProfit >= 0 ? '+' : ''}€${netProfit.toFixed(2)}`} color={netProfit >= 0 ? Colors.green : Colors.red} delay={180} />
          <MetricTile icon="🎫" label="Ticket medio" value={`€${avgTicket.toFixed(2)}`} sub={`${txCount} venta${txCount !== 1 ? 's' : ''}`} color={Colors.orange} delay={220} />
        </View>

        {/* Quick actions */}
        <Animated.View entering={FadeInDown.delay(260).duration(400)} style={styles.actions}>
          <ActionBtn icon="flash" label="Vender" color={Colors.primary} onPress={() => navigation.navigate('QuickTap')} />
          <ActionBtn icon="warning" label="Panic" color={Colors.orange} onPress={() => navigation.navigate('PanicMode')} />
          <ActionBtn icon="bar-chart" label="Reportes" color={Colors.blue} onPress={() => navigation.navigate('Reports')} />
        </Animated.View>

        {/* Recent transactions */}
        {recentTxs.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Últimas ventas</Text>
            <View style={styles.txList}>
              {recentTxs.map((tx, i) => {
                const disc = tx.discount ?? 0;
                const margin = tx.netMargin ?? 0;
                return (
                  <View key={tx.id} style={[styles.txRow, i < recentTxs.length - 1 && styles.txRowBorder]}>
                    <View style={styles.txLeft}>
                      <Text style={styles.txName}>{tx.productName}</Text>
                      <Text style={styles.txTime}>{new Date(tx.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={styles.txRight}>
                      {disc > 0 && <Text style={styles.txDiscount}>-€{disc.toFixed(2)}</Text>}
                      <Text style={[styles.txAmount, { color: margin >= 0 ? Colors.green : Colors.red }]}>€{tx.salePrice.toFixed(2)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionBtn({ icon, label, color, onPress }: { icon: any; label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.actionBtn, { borderColor: color + '30' }]} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.actionIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg0 },
  scroll: { padding: S.xl, paddingBottom: 40 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerSuper: { fontSize: F.caption, fontWeight: F.semibold, color: Colors.label3, letterSpacing: 0.6, textTransform: 'uppercase' },
  headerTitle: { fontSize: F.title2, fontWeight: F.bold, color: Colors.label1, letterSpacing: -0.3, marginTop: 2 },
  settingsBtn: { width: 38, height: 38, borderRadius: R.full, backgroundColor: Colors.bg3, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.sep },

  breakEvenCard: {
    backgroundColor: Colors.bg2, borderRadius: R.xl,
    borderWidth: 1, borderColor: Colors.sep, marginBottom: 16,
    overflow: 'hidden',
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  tile: {
    flex: 1, minWidth: '46%', backgroundColor: Colors.bg2,
    borderRadius: R.lg, borderWidth: 1, borderColor: Colors.sep,
    padding: 16,
  },
  tileIcon: { width: 36, height: 36, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  tileValue: { fontSize: F.title3, fontWeight: F.bold, letterSpacing: -0.3 },
  tileLabel: { fontSize: F.caption, color: Colors.label3, marginTop: 2, fontWeight: F.medium },
  tileSub: { fontSize: F.micro, color: Colors.label4, marginTop: 1 },

  actions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  actionBtn: {
    flex: 1, backgroundColor: Colors.bg2, borderRadius: R.lg,
    borderWidth: 1, padding: 14, alignItems: 'center', gap: 8,
  },
  actionIcon: { width: 44, height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: F.caption, fontWeight: F.semibold },

  section: { backgroundColor: Colors.bg2, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.sep, overflow: 'hidden' },
  sectionTitle: { fontSize: F.footnote, fontWeight: F.semibold, color: Colors.label3, padding: 16, paddingBottom: 8, letterSpacing: 0.3, textTransform: 'uppercase' },
  txList: {},
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  txRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.sep },
  txLeft: {},
  txRight: { alignItems: 'flex-end' },
  txName: { fontSize: F.sub, fontWeight: F.medium, color: Colors.label1 },
  txTime: { fontSize: F.caption, color: Colors.label4, marginTop: 1 },
  txDiscount: { fontSize: F.micro, color: Colors.orange },
  txAmount: { fontSize: F.body, fontWeight: F.semibold },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
  emptyTitle: { fontSize: F.title3, fontWeight: F.bold, color: Colors.label1 },
  emptySub: { fontSize: F.body, color: Colors.label3, textAlign: 'center' },
  emptyBtn: { marginTop: 16, backgroundColor: Colors.primary, borderRadius: R.md, paddingHorizontal: 28, paddingVertical: 12 },
  emptyBtnLabel: { fontSize: F.callout, fontWeight: F.semibold, color: '#fff' },
});
