import { browser } from '$app/environment';
import { db, type Sale } from '$lib/db';

let _sales = $state<Sale[]>([]);
let _loaded = $state(false);

export const sales = {
  get all() { return _sales; },
  get loaded() { return _loaded; },
  get count() { return _sales.length; },
  get grossRevenue() { return _sales.reduce((s, x) => s + x.finalPrice, 0); },
  get last5() { return [..._sales].sort((a, b) => +b.timestamp - +a.timestamp).slice(0, 5); },

  topProducts(limit = 5): { name: string; emoji: string; revenue: number; count: number }[] {
    const map = new Map<string, { name: string; emoji: string; revenue: number; count: number }>();
    for (const s of _sales) {
      const e = map.get(s.productName) ?? { name: s.productName, emoji: s.emoji, revenue: 0, count: 0 };
      e.revenue += s.finalPrice;
      e.count += 1;
      map.set(s.productName, e);
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
  },

  async load() {
    if (!browser) return;
    _sales = await db.sales.toArray();
    _loaded = true;
  },

  async add(sale: Omit<Sale, 'id'>) {
    const id = await db.sales.add(sale as Sale);
    _sales = [..._sales, { ...sale, id }];
  },

  async clear() {
    await db.sales.clear();
    _sales = [];
  },
};
