export interface StandStats {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalTransactions: number;
  averageTicket: number;
  breakEven: number;
  breakEvenProgress: number;
  netRevenue: number;
  netProfit: number;
  topProduct: string | null;
  hourlyRevenue: Record<string, number>;
}

export interface Transaction {
  id: string;
  stand_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  original_price: number;
  sale_price: number;
  discount_amount: number;
  cost_price: number;
  net_margin: number;
  cashier_id?: string;
  cashier_name?: string;
  is_combo: number;
  combo_description?: string;
  notes?: string;
  is_voided: number;
  created_at: string;
}

export function calculateBreakEven(standCost: number, inventoryCost: number): number {
  return standCost + inventoryCost;
}

export function calculateNetRevenue(totalRevenue: number, commissionRate: number): number {
  return totalRevenue * (1 - commissionRate);
}

export function calculateNetProfit(
  totalRevenue: number,
  totalCost: number,
  commissionRate: number,
  standCost: number,
  inventoryCost: number
): number {
  const netRevenue = calculateNetRevenue(totalRevenue, commissionRate);
  return netRevenue - totalCost - standCost - inventoryCost;
}

export function calculateBreakEvenProgress(
  totalRevenue: number,
  standCost: number,
  inventoryCost: number,
  commissionRate: number
): number {
  const breakEven = calculateBreakEven(standCost, inventoryCost);
  if (breakEven === 0) return 100;
  const netRevenue = calculateNetRevenue(totalRevenue, commissionRate);
  return Math.min((netRevenue / breakEven) * 100, 100);
}

export function calculateFloorPrices(
  costPrice: number,
  commissionRate: number,
  standCost: number,
  inventoryCost: number,
  estimatedUnits: number = 100
): { floorPrice: number; recommendedPrice: number; premiumPrice: number } {
  const overheadPerUnit = estimatedUnits > 0 ? (standCost + inventoryCost) / estimatedUnits : 0;
  const totalCostPerUnit = costPrice + overheadPerUnit;
  const floorPrice = totalCostPerUnit / (1 - commissionRate);
  const recommendedPrice = floorPrice * 1.3;
  const premiumPrice = floorPrice * 1.6;
  
  return {
    floorPrice: Math.ceil(floorPrice * 100) / 100,
    recommendedPrice: Math.ceil(recommendedPrice * 100) / 100,
    premiumPrice: Math.ceil(premiumPrice * 100) / 100,
  };
}

export function calculateStandStats(
  transactions: Transaction[],
  standCost: number,
  inventoryCost: number,
  commissionRate: number
): StandStats {
  const activeTransactions = transactions.filter(t => !t.is_voided);
  
  const totalRevenue = activeTransactions.reduce((sum, t) => sum + (t.sale_price * t.quantity), 0);
  const totalCost = activeTransactions.reduce((sum, t) => sum + (t.cost_price * t.quantity), 0);
  const totalTransactions = activeTransactions.length;
  const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  
  const breakEven = calculateBreakEven(standCost, inventoryCost);
  const breakEvenProgress = calculateBreakEvenProgress(totalRevenue, standCost, inventoryCost, commissionRate);
  const netRevenue = calculateNetRevenue(totalRevenue, commissionRate);
  const netProfit = netRevenue - totalCost - standCost - inventoryCost;

  const productRevenue: Record<string, number> = {};
  for (const t of activeTransactions) {
    productRevenue[t.product_name] = (productRevenue[t.product_name] || 0) + (t.sale_price * t.quantity);
  }
  const topProduct = Object.keys(productRevenue).length > 0
    ? Object.keys(productRevenue).reduce((a, b) => productRevenue[a] > productRevenue[b] ? a : b)
    : null;

  const hourlyRevenue: Record<string, number> = {};
  for (const t of activeTransactions) {
    const hour = new Date(t.created_at).getHours().toString().padStart(2, '0') + ':00';
    hourlyRevenue[hour] = (hourlyRevenue[hour] || 0) + (t.sale_price * t.quantity);
  }
  
  return {
    totalRevenue,
    totalCost,
    totalProfit: totalRevenue - totalCost,
    totalTransactions,
    averageTicket,
    breakEven,
    breakEvenProgress,
    netRevenue,
    netProfit,
    topProduct,
    hourlyRevenue,
  };
}
