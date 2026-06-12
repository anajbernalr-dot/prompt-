import type { Sale } from '$lib/db';
import { netAfterFees, ticketAverage } from './financials';

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateCSV(sales: Sale[], roomCode: string): void {
  const header = 'Fecha,Hora,Producto,Precio Original,Precio Final,Descuento %,Coste,Margen,Sala';
  const rows = sales.map((s) => {
    const d = new Date(s.timestamp);
    return [
      d.toLocaleDateString('es-ES'),
      d.toLocaleTimeString('es-ES'),
      `"${s.productName}"`,
      s.originalPrice.toFixed(2),
      s.finalPrice.toFixed(2),
      s.discountPct.toFixed(1),
      s.cost.toFixed(2),
      (s.finalPrice - s.cost).toFixed(2),
      s.roomCode,
    ].join(',');
  });
  const csv = '﻿' + [header, ...rows].join('\n');
  download(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `popup-ventas-${Date.now()}.csv`);
}

export async function generatePDFReport(
  sales: Sale[],
  opts: { roomCode: string; eventName: string; feePct: number; breakEvenTarget: number }
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  const gross = sales.reduce((s, x) => s + x.finalPrice, 0);
  const net = netAfterFees(gross, opts.feePct);
  const avg = ticketAverage(sales);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('PopUp Analytics', 20, 24);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110);
  doc.text(`${opts.eventName} · Sala ${opts.roomCode} · ${new Date().toLocaleDateString('es-ES')}`, 20, 32);

  // KPIs
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Resumen ejecutivo', 20, 48);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const kpis = [
    ['Transacciones', String(sales.length)],
    ['Ingresos brutos', `${gross.toFixed(2)} EUR`],
    [`Comisión festival (${(opts.feePct * 100).toFixed(0)}%)`, `-${(gross - net).toFixed(2)} EUR`],
    ['Dinero limpio', `${net.toFixed(2)} EUR`],
    ['Ticket medio', `${avg.toFixed(2)} EUR`],
    ['Objetivo break-even', `${opts.breakEvenTarget.toFixed(2)} EUR`],
  ];
  let y = 56;
  for (const [k, v] of kpis) {
    doc.setTextColor(110);
    doc.text(k, 20, y);
    doc.setTextColor(0);
    doc.text(v, 120, y);
    y += 7;
  }

  // Product table
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Ventas por producto', 20, y);
  y += 8;
  doc.setFontSize(10);
  doc.text('Producto', 20, y);
  doc.text('Uds', 110, y);
  doc.text('Ingresos', 140, y);
  doc.setFont('helvetica', 'normal');
  y += 6;

  const byProduct = new Map<string, { count: number; revenue: number }>();
  for (const s of sales) {
    const e = byProduct.get(s.productName) ?? { count: 0, revenue: 0 };
    e.count++;
    e.revenue += s.finalPrice;
    byProduct.set(s.productName, e);
  }
  for (const [name, e] of [...byProduct.entries()].sort((a, b) => b[1].revenue - a[1].revenue)) {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(name, 20, y);
    doc.text(String(e.count), 110, y);
    doc.text(`${e.revenue.toFixed(2)} EUR`, 140, y);
    y += 6;
  }

  doc.save(`popup-reporte-${Date.now()}.pdf`);
}
