import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useStore } from '../store/useStore';
import { TransactionItem } from '../components/TransactionItem';
import { StatCard } from '../components/StatCard';
import {
  calculateGrossRevenue,
  calculateNetRevenue,
  calculateTotalCOGS,
  calculateNetProfit,
  getBestSeller,
  getSalesByProduct,
  formatCurrency,
} from '../utils/calculations';
import { exportCSV } from '../utils/exportUtils';

type Props = { navigation: any };

export default function ReportsScreen({ navigation }: Props) {
  const currentStand = useStore((s) => s.currentStand);
  const currentEvent = useStore((s) => s.currentEvent);
  const [exporting, setExporting] = useState(false);

  const commissionRate = currentEvent?.commissionRate ?? 0;

  const stats = useMemo(() => {
    if (!currentStand) return null;
    const txs = currentStand.transactions;
    const gross = calculateGrossRevenue(txs);
    const net = calculateNetRevenue(gross, commissionRate);
    const cogs = calculateTotalCOGS(txs);
    const profit = calculateNetProfit(net, cogs);
    const salesByProduct = getSalesByProduct(txs);
    const bestSeller = getBestSeller(txs);
    return { gross, net, cogs, profit, salesByProduct, bestSeller, txCount: txs.length };
  }, [currentStand, commissionRate]);

  const productSales = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.salesByProduct)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [stats]);

  const maxProductTotal = productSales.length > 0 ? productSales[0].total : 1;

  const handleExportCSV = async () => {
    if (!currentStand) return;
    setExporting(true);
    try {
      await exportCSV(currentStand, commissionRate);
    } catch (e) {
      Alert.alert('Error', 'No se pudo exportar el reporte. Intenta de nuevo.');
    } finally {
      setExporting(false);
    }
  };

  if (!currentStand || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>No hay datos disponibles</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportes</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Summary Cards */}
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
            subtitle={commissionRate > 0 ? `Comisión: ${formatCurrency(stats.gross * commissionRate)}` : undefined}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            title="Costo de Mercancía"
            value={formatCurrency(stats.cogs)}
            icon="cube-outline"
            color={Colors.warning}
          />
          <StatCard
            title="Ganancia Neta"
            value={formatCurrency(stats.profit)}
            icon={stats.profit >= 0 ? 'trending-up-outline' : 'trending-down-outline'}
            color={stats.profit >= 0 ? Colors.accent : Colors.danger}
          />
        </View>

        <View style={styles.row2}>
          <View style={styles.smallCard}>
            <Ionicons name="receipt-outline" size={18} color={Colors.subtext} />
            <Text style={styles.smallCardValue}>{stats.txCount}</Text>
            <Text style={styles.smallCardLabel}>Transacciones</Text>
          </View>
          <View style={[styles.smallCard, { flex: 2 }]}>
            <Ionicons name="star-outline" size={18} color={Colors.warning} />
            <Text style={styles.smallCardValue} numberOfLines={1}>{stats.bestSeller}</Text>
            <Text style={styles.smallCardLabel}>Más Vendido</Text>
          </View>
        </View>

        {/* Bar Chart */}
        {productSales.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Ventas por Producto</Text>
            {productSales.map((item) => (
              <View key={item.id} style={styles.barRow}>
                <Text style={styles.barLabel} numberOfLines={1}>{item.name}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${(item.total / maxProductTotal) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.barValue}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Export Buttons */}
        <View style={styles.exportRow}>
          <TouchableOpacity
            style={[styles.exportButton, exporting && styles.disabledButton]}
            onPress={handleExportCSV}
            disabled={exporting}
          >
            <Ionicons name="document-text-outline" size={18} color={Colors.accent} />
            <Text style={styles.exportButtonText}>
              {exporting ? 'Exportando...' : 'Exportar CSV'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <Text style={styles.sectionTitle}>Historial de Transacciones ({stats.txCount})</Text>
        {currentStand.transactions.length === 0 ? (
          <View style={styles.noTx}>
            <Text style={styles.noTxText}>Sin transacciones registradas</Text>
          </View>
        ) : (
          <View style={styles.txList}>
            {currentStand.transactions.map((t) => (
              <TransactionItem key={t.id} transaction={t} />
            ))}
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
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  scrollContent: { padding: 14, gap: 12 },
  statsRow: { flexDirection: 'row', gap: 0 },
  row2: { flexDirection: 'row', gap: 8 },
  smallCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  smallCardValue: { color: Colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  smallCardLabel: { color: Colors.subtext, fontSize: 11, textAlign: 'center' },
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  chartTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { color: Colors.subtext, fontSize: 12, width: 90 },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  barValue: { color: Colors.text, fontSize: 12, fontWeight: '600', width: 60, textAlign: 'right' },
  exportRow: { gap: 8 },
  exportButton: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.accent + '55',
  },
  disabledButton: { opacity: 0.5 },
  exportButtonText: { color: Colors.accent, fontSize: 15, fontWeight: '700' },
  sectionTitle: {
    color: Colors.subtext,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  txList: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noTx: { alignItems: 'center', paddingVertical: 20 },
  noTxText: { color: Colors.subtext, fontSize: 14 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 56 },
  emptyText: { color: Colors.text, fontSize: 18, fontWeight: '700' },
});
