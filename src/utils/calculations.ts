import { Stand, Transaction, Product } from '../store/useStore';

export function calculateBreakEven(stand: Stand): number {
  return stand.standCost + stand.inventoryCost;
}

export function calculateGrossRevenue(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.salePrice * t.quantity, 0);
}

export function calculateNetRevenue(grossRevenue: number, commissionRate: number): number {
  return grossRevenue * (1 - commissionRate);
}

export function calculateTotalCOGS(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.costPrice * t.quantity, 0);
}

export function calculateNetProfit(netRevenue: number, totalCOGS: number): number {
  return netRevenue - totalCOGS;
}

export function calculateBreakEvenProgress(stand: Stand, commissionRate: number = 0): number {
  const breakEven = calculateBreakEven(stand);
  if (breakEven <= 0) return 1;
  const gross = calculateGrossRevenue(stand.transactions);
  const net = calculateNetRevenue(gross, commissionRate);
  const cogs = calculateTotalCOGS(stand.transactions);
  const profit = calculateNetProfit(net, cogs);
  return Math.min(1, Math.max(0, (profit + breakEven) / breakEven));
}

export function calculateFloorPrice(
  product: Product,
  remainingBreakEven: number,
  remainingStock: number
): number {
  if (remainingStock <= 0) return product.costPrice;
  const contributionNeeded = remainingBreakEven / remainingStock;
  return Math.max(product.costPrice, product.costPrice + contributionNeeded);
}

export function calculateRemainingBreakEven(stand: Stand, commissionRate: number = 0): number {
  const breakEven = calculateBreakEven(stand);
  const gross = calculateGrossRevenue(stand.transactions);
  const net = calculateNetRevenue(gross, commissionRate);
  const cogs = calculateTotalCOGS(stand.transactions);
  const profit = calculateNetProfit(net, cogs);
  return Math.max(0, breakEven - profit);
}

export function calculateTotalStock(stand: Stand): number {
  return stand.products.reduce((sum, p) => sum + p.stock, 0);
}

export function getBestSeller(transactions: Transaction[]): string {
  const counts: Record<string, { name: string; count: number }> = {};
  for (const t of transactions) {
    if (!counts[t.productId]) {
      counts[t.productId] = { name: t.productName, count: 0 };
    }
    counts[t.productId].count += t.quantity;
  }
  let best = '';
  let bestCount = 0;
  for (const key of Object.keys(counts)) {
    if (counts[key].count > bestCount) {
      bestCount = counts[key].count;
      best = counts[key].name;
    }
  }
  return best || '—';
}

export function getSalesByProduct(transactions: Transaction[]): Record<string, { name: string; total: number; count: number }> {
  const result: Record<string, { name: string; total: number; count: number }> = {};
  for (const t of transactions) {
    if (!result[t.productId]) {
      result[t.productId] = { name: t.productName, total: 0, count: 0 };
    }
    result[t.productId].total += t.salePrice * t.quantity;
    result[t.productId].count += t.quantity;
  }
  return result;
}

export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function getMotivationalMessage(progress: number): string {
  if (progress >= 1) return '¡Felicidades! Ya cubriste tus costos. Todo lo que vendas es ganancia pura. 🎉';
  if (progress >= 0.8) return '¡Casi lo logras! Estás muy cerca del punto de equilibrio. ¡Un último esfuerzo!';
  if (progress >= 0.5) return '¡Vas por buen camino! Ya llevas más de la mitad. Sigue así.';
  if (progress >= 0.25) return 'Buen inicio. Enfócate en los productos con mayor margen. ¡Tú puedes!';
  return 'Recién empieza. Activa el Modo Pánico para ver las estrategias de liquidación.';
}
