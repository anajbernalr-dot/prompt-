import type { Sale } from '$lib/db';

// All functions are pure — no side effects.

export function netAfterFees(grossRevenue: number, feePct: number): number {
  return grossRevenue * (1 - feePct);
}

export function breakEvenProgress(netRevenue: number, target: number): number {
  if (target <= 0) return 100;
  return Math.min((netRevenue / target) * 100, 100);
}

export function netProfit(netRevenue: number, target: number): number {
  return Math.max(netRevenue - target, 0);
}

export function ticketAverage(sales: Sale[]): number {
  if (sales.length === 0) return 0;
  return sales.reduce((s, x) => s + x.finalPrice, 0) / sales.length;
}

export function panicFloorPrice(cost: number): number {
  return +(cost * 1.06).toFixed(2);
}

export function maxDiscount(price: number, cost: number): number {
  if (price <= 0) return 0;
  return +(((price - panicFloorPrice(cost)) / price) * 100).toFixed(1);
}
