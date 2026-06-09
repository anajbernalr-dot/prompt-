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
import {
  calculateGrossRevenue,
  calculateNetRevenue,
  calculateTotalCOGS,
  calculateNetProfit,
  formatCurrency,
} from '../utils/calculations';
import { exportConsolidatedCSV } from '../utils/exportUtils';

type Props = { navigation: any };

export default function OrganizerDashboardScreen({ navigation }: Props) {
  const currentEvent = useStore((s) => s.currentEvent);
  const [exporting, setExporting] = useState(false);

  const eventData = useMemo(() => {
    if (!currentEvent) return null;
    const commRate = currentEvent.commissionRate;
    const stands = currentEvent.stands;

    const standStats = stands.map((stand) => {
      const gross = calculateGrossRevenue(stand.transactions);
      const net = calculateNetRevenue(gross, commRate);
      const cogs = calculateTotalCOGS(stand.transactions);
      const profit = calculateNetProfit(net, cogs);
      return { stand, gross, net, cogs, profit, txCount: stand.transactions.length };
    });

    const totalGross = standStats.reduce((s, st) => s + st.gross, 0);
    const totalNet = calculateNetRevenue(totalGross, commRate);
    const totalCommission = totalGross * commRate;
    const totalTx = standStats.reduce((s, st) => s + st.txCount, 0);

    return { standStats, totalGross, totalNet, totalCommission, totalTx, commRate };
  }, [currentEvent]);

  const handleExport = async () => {
    if (!currentEvent) return;
    setExporting(true);
    try {
      await exportConsolidatedCSV(currentEvent.name, currentEvent.stands, currentEvent.commissionRate);
    } catch (e) {
      Alert.alert('Error', 'No se pudo exportar el reporte consolidado.');
    } finally {
      setExporting(false);
    }
  };

  if (!currentEvent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No hay evento activo</Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('OrganizerSetup')}>
            <Text style={styles.createBtnText}>Crear Evento</Text>
          </TouchableOpacity>
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{currentEvent.name}</Text>
          <Text style={styles.headerSub}>{currentEvent.location}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Event code */}
        <View style={styles.codeCard}>
          <Ionicons name="qr-code-outline" size={18} color={Colors.primary} />
          <Text style={styles.codeLabel}>Código del evento:</Text>
          <Text style={styles.codeValue}>{currentEvent.accessCode}</Text>
        </View>

        {/* Totals */}
        {eventData && (
          <>
            <View style={styles.totalGrid}>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Ventas Brutas</Text>
                <Text style={[styles.totalValue, { color: Colors.primary }]}>
                  {formatCurrency(eventData.totalGross)}
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Comisión Recaudada</Text>
                <Text style={[styles.totalValue, { color: Colors.accent }]}>
                  {formatCurrency(eventData.totalCommission)}
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Total Transacciones</Text>
                <Text style={[styles.totalValue, { color: Colors.warning }]}>
                  {eventData.totalTx}
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Stands Activos</Text>
                <Text style={[styles.totalValue, { color: Colors.info }]}>
                  {currentEvent.stands.length}/{currentEvent.maxStands}
                </Text>
              </View>
            </View>

            {/* Stands Table */}
            <Text style={styles.sectionTitle}>Desempeño de Puestos</Text>
            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.tableCellWide, styles.tableHeaderText]}>Puesto</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Tx</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Bruto</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Neto</Text>
              </View>
              {eventData.standStats.length === 0 ? (
                <View style={styles.noStands}>
                  <Text style={styles.noStandsText}>No hay puestos registrados aún</Text>
                </View>
              ) : (
                eventData.standStats.map(({ stand, gross, net, txCount }) => (
                  <View key={stand.id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableCellWide, styles.tableCellText]} numberOfLines={1}>
                      {stand.name}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellText]}>{txCount}</Text>
                    <Text style={[styles.tableCell, styles.tableCellText]}>{formatCurrency(gross)}</Text>
                    <Text style={[styles.tableCell, styles.tableCellText, { color: Colors.accent }]}>
                      {formatCurrency(net)}
                    </Text>
                  </View>
                ))
              )}
            </View>

            {/* Activity Heatmap Placeholder */}
            <View style={styles.heatmapCard}>
              <View style={styles.heatmapHeader}>
                <Ionicons name="map-outline" size={18} color={Colors.primary} />
                <Text style={styles.heatmapTitle}>Mapa de Actividad</Text>
              </View>
              <View style={styles.heatmapGrid}>
                {Array.from({ length: 20 }).map((_, i) => {
                  const stand = currentEvent.stands[i % Math.max(1, currentEvent.stands.length)];
                  const txCount = stand?.transactions.length ?? 0;
                  const intensity = Math.min(1, txCount / 20);
                  return (
                    <View
                      key={i}
                      style={[
                        styles.heatmapCell,
                        {
                          backgroundColor:
                            i < currentEvent.stands.length
                              ? `rgba(108, 99, 255, ${0.15 + intensity * 0.85})`
                              : Colors.background,
                        },
                      ]}
                    />
                  );
                })}
              </View>
              <Text style={styles.heatmapLegend}>
                {currentEvent.stands.length} puestos registrados · {currentEvent.maxStands - currentEvent.stands.length} disponibles
              </Text>
            </View>

            {/* Export */}
            <TouchableOpacity
              style={[styles.exportButton, exporting && styles.disabledButton]}
              onPress={handleExport}
              disabled={exporting}
            >
              <Ionicons name="download-outline" size={18} color={Colors.accent} />
              <Text style={styles.exportButtonText}>
                {exporting ? 'Exportando...' : 'Exportar Reporte Consolidado'}
              </Text>
            </TouchableOpacity>
          </>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  headerCenter: { flex: 1 },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  headerSub: { color: Colors.subtext, fontSize: 12, marginTop: 2 },
  scrollContent: { padding: 16, gap: 14 },
  codeCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  codeLabel: { color: Colors.subtext, fontSize: 13 },
  codeValue: { color: Colors.primary, fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  totalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  totalItem: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  totalLabel: { color: Colors.subtext, fontSize: 11, marginBottom: 4 },
  totalValue: { fontSize: 20, fontWeight: '800' },
  sectionTitle: {
    color: Colors.subtext,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '88',
  },
  tableCell: { flex: 1, textAlign: 'right' },
  tableCellWide: { flex: 2, textAlign: 'left' },
  tableHeaderText: { color: Colors.subtext, fontSize: 11, fontWeight: '600' },
  tableCellText: { color: Colors.text, fontSize: 13 },
  noStands: { alignItems: 'center', paddingVertical: 24 },
  noStandsText: { color: Colors.subtext, fontSize: 14 },
  heatmapCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  heatmapHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heatmapTitle: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  heatmapCell: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  heatmapLegend: { color: Colors.subtext, fontSize: 12, textAlign: 'center' },
  exportButton: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.accent + '55',
    marginBottom: 16,
  },
  disabledButton: { opacity: 0.5 },
  exportButtonText: { color: Colors.accent, fontSize: 15, fontWeight: '700' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 56 },
  emptyText: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createBtnText: { color: Colors.text, fontSize: 15, fontWeight: '700' },
});
