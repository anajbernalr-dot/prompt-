import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useStore } from '../store/useStore';
import { BreakEvenBar } from '../components/BreakEvenBar';
import { StatCard } from '../components/StatCard';
import { TransactionItem } from '../components/TransactionItem';
import {
  calculateGrossRevenue,
  calculateNetRevenue,
  calculateTotalCOGS,
  calculateNetProfit,
  calculateBreakEvenProgress,
  getBestSeller,
  formatCurrency,
} from '../utils/calculations';

type Props = { navigation: any };

export default function DashboardScreen({ navigation }: Props) {
  const currentStand = useStore((s) => s.currentStand);
  const currentEvent = useStore((s) => s.currentEvent);
  const userRole = useStore((s) => s.userRole);

  const commissionRate = currentEvent?.commissionRate ?? 0;

  const stats = useMemo(() => {
    if (!currentStand) return null;
    const txs = currentStand.transactions;
    const gross = calculateGrossRevenue(txs);
    const net = calculateNetRevenue(gross, commissionRate);
    const cogs = calculateTotalCOGS(txs);
    const profit = calculateNetProfit(net, cogs);
    const progress = calculateBreakEvenProgress(currentStand, commissionRate);
    return {
      gross,
      net,
      cogs,
      profit,
      progress,
      txCount: txs.length,
      bestSeller: getBestSeller(txs),
    };
  }, [currentStand, commissionRate]);

  const recentTransactions = currentStand?.transactions.slice(0, 10) ?? [];

  if (!currentStand) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏪</Text>
          <Text style={styles.emptyText}>No hay puesto configurado</Text>
          <TouchableOpacity style={styles.setupButton} onPress={() => navigation.navigate('StandSetup')}>
            <Text style={styles.setupButtonText}>Configurar Puesto</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.storeName}>{currentStand.name}</Text>
          {currentEvent && (
            <Text style={styles.eventName}>{currentEvent.name}</Text>
          )}
        </View>
        {userRole === 'organizer' && (
          <TouchableOpacity
            style={styles.orgBadge}
            onPress={() => navigation.navigate('OrganizerDashboard')}
          >
            <Ionicons name="grid-outline" size={16} color={Colors.primary} />
            <Text style={styles.orgBadgeText}>Org.</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={false} tintColor={Colors.primary} />}
      >
        {stats && (
          <>
            <View style={styles.breakEvenSection}>
              <BreakEvenBar progress={stats.progress} />
            </View>

            <View style={styles.statsRow}>
              <StatCard
                title="Ventas Brutas"
                value={formatCurrency(stats.gross)}
                icon="cash-outline"
                color={Colors.primary}
              />
              <StatCard
                title="Ventas Netas"
                value={formatCurrency(stats.net)}
                icon="wallet-outline"
                color={Colors.info}
                subtitle={commissionRate > 0 ? `-${(commissionRate * 100).toFixed(0)}% comisión` : undefined}
              />
            </View>

            <View style={styles.statsRow}>
              <StatCard
                title="Ganancia Neta"
                value={formatCurrency(stats.profit)}
                icon={stats.profit >= 0 ? 'trending-up-outline' : 'trending-down-outline'}
                color={stats.profit >= 0 ? Colors.accent : Colors.danger}
              />
              <StatCard
                title="Transacciones"
                value={stats.txCount.toString()}
                icon="receipt-outline"
                color={Colors.warning}
              />
            </View>

            {stats.bestSeller !== '—' && (
              <View style={styles.bestSellerCard}>
                <Ionicons name="star-outline" size={16} color={Colors.warning} />
                <Text style={styles.bestSellerLabel}>Más vendido:</Text>
                <Text style={styles.bestSellerName}>{stats.bestSeller}</Text>
              </View>
            )}
          </>
        )}

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButtonPrimary}
            onPress={() => navigation.navigate('QuickTap')}
          >
            <Ionicons name="flash" size={22} color={Colors.text} />
            <Text style={styles.actionButtonPrimaryText}>Registrar Venta</Text>
          </TouchableOpacity>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('PanicMode')}
            >
              <Ionicons name="warning-outline" size={20} color={Colors.danger} />
              <Text style={[styles.actionButtonText, { color: Colors.danger }]}>Modo Pánico</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Reports')}
            >
              <Ionicons name="bar-chart-outline" size={20} color={Colors.primary} />
              <Text style={[styles.actionButtonText, { color: Colors.primary }]}>Reportes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {recentTransactions.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Últimas Transacciones</Text>
            <View style={styles.transactionList}>
              {recentTransactions.map((t) => (
                <TransactionItem key={t.id} transaction={t} />
              ))}
            </View>
            {currentStand.transactions.length > 10 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('Reports')}
              >
                <Text style={styles.viewAllText}>Ver todas las transacciones</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {recentTransactions.length === 0 && (
          <View style={styles.noTransactions}>
            <Text style={styles.noTxIcon}>💸</Text>
            <Text style={styles.noTxText}>Sin transacciones aún</Text>
            <Text style={styles.noTxSubtext}>Registra tu primera venta tocando "Registrar Venta"</Text>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  storeName: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  eventName: { color: Colors.subtext, fontSize: 12, marginTop: 2 },
  orgBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '22',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
  },
  orgBadgeText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  scrollContent: { padding: 14, gap: 10 },
  breakEvenSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsRow: { flexDirection: 'row', gap: 0 },
  bestSellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.warning + '44',
  },
  bestSellerLabel: { color: Colors.subtext, fontSize: 13 },
  bestSellerName: { color: Colors.warning, fontSize: 14, fontWeight: '700', flex: 1 },
  quickActions: { gap: 10, marginTop: 4 },
  actionButtonPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  actionButtonPrimaryText: { color: Colors.text, fontSize: 17, fontWeight: '800' },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: { fontSize: 14, fontWeight: '700' },
  recentSection: { marginTop: 8 },
  sectionTitle: {
    color: Colors.subtext,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  transactionList: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  viewAllText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 56 },
  emptyText: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  setupButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  setupButtonText: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  noTransactions: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  noTxIcon: { fontSize: 48 },
  noTxText: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  noTxSubtext: { color: Colors.subtext, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
