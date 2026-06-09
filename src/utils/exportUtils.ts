import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Transaction, Stand } from '../store/useStore';
import { formatCurrency, calculateGrossRevenue, calculateNetRevenue, calculateTotalCOGS, calculateNetProfit, getBestSeller } from './calculations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export async function exportCSV(stand: Stand, commissionRate: number = 0): Promise<void> {
  const headers = [
    'ID', 'Fecha', 'Hora', 'Producto', 'Cantidad', 'Precio Original',
    'Precio Venta', 'Descuento', 'Costo', 'Margen Neto', 'Cajero', 'Es Combo'
  ];

  const rows = stand.transactions.map((t) => {
    const date = new Date(t.timestamp);
    return [
      t.id,
      format(date, 'dd/MM/yyyy', { locale: es }),
      format(date, 'HH:mm:ss'),
      `"${t.productName}"`,
      t.quantity.toString(),
      t.originalPrice.toFixed(2),
      t.salePrice.toFixed(2),
      `${t.discount}%`,
      t.costPrice.toFixed(2),
      t.netMargin.toFixed(2),
      `"${t.cashierId}"`,
      t.isCombo ? 'Sí' : 'No',
    ].join(',');
  });

  const gross = calculateGrossRevenue(stand.transactions);
  const net = calculateNetRevenue(gross, commissionRate);
  const cogs = calculateTotalCOGS(stand.transactions);
  const profit = calculateNetProfit(net, cogs);

  const summary = [
    '',
    '--- RESUMEN ---',
    `Ventas Brutas,${gross.toFixed(2)}`,
    `Comisión (${(commissionRate * 100).toFixed(0)}%),${(gross * commissionRate).toFixed(2)}`,
    `Ventas Netas,${net.toFixed(2)}`,
    `Costo de Mercancía,${cogs.toFixed(2)}`,
    `Ganancia Neta,${profit.toFixed(2)}`,
    `Mejor Producto,"${getBestSeller(stand.transactions)}"`,
  ];

  const csv = [headers.join(','), ...rows, ...summary].join('\n');
  const filename = `${FileSystem.documentDirectory}reporte_${stand.name.replace(/\s/g, '_')}_${Date.now()}.csv`;

  await FileSystem.writeAsStringAsync(filename, csv, { encoding: FileSystem.EncodingType.UTF8 });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(filename, {
      mimeType: 'text/csv',
      dialogTitle: 'Exportar Reporte CSV',
    });
  }
}

export async function exportConsolidatedCSV(
  eventName: string,
  stands: Stand[],
  commissionRate: number
): Promise<void> {
  const headers = ['Stand', 'Transacciones', 'Ventas Brutas', 'Comisión', 'Ventas Netas', 'COGS', 'Ganancia Neta'];

  const rows = stands.map((stand) => {
    const gross = calculateGrossRevenue(stand.transactions);
    const net = calculateNetRevenue(gross, commissionRate);
    const cogs = calculateTotalCOGS(stand.transactions);
    const profit = calculateNetProfit(net, cogs);
    return [
      `"${stand.name}"`,
      stand.transactions.length.toString(),
      gross.toFixed(2),
      (gross * commissionRate).toFixed(2),
      net.toFixed(2),
      cogs.toFixed(2),
      profit.toFixed(2),
    ].join(',');
  });

  const totalGross = stands.reduce((s, st) => s + calculateGrossRevenue(st.transactions), 0);
  const totalNet = calculateNetRevenue(totalGross, commissionRate);
  const totalCogs = stands.reduce((s, st) => s + calculateTotalCOGS(st.transactions), 0);
  const totalProfit = calculateNetProfit(totalNet, totalCogs);

  const totals = [
    '',
    `"TOTAL EVENTO",${stands.reduce((s, st) => s + st.transactions.length, 0)},${totalGross.toFixed(2)},${(totalGross * commissionRate).toFixed(2)},${totalNet.toFixed(2)},${totalCogs.toFixed(2)},${totalProfit.toFixed(2)}`,
  ];

  const csv = [`"Reporte Consolidado: ${eventName}"`, '', headers.join(','), ...rows, ...totals].join('\n');
  const filename = `${FileSystem.documentDirectory}reporte_evento_${eventName.replace(/\s/g, '_')}_${Date.now()}.csv`;

  await FileSystem.writeAsStringAsync(filename, csv, { encoding: FileSystem.EncodingType.UTF8 });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(filename, {
      mimeType: 'text/csv',
      dialogTitle: 'Exportar Reporte del Evento',
    });
  }
}
