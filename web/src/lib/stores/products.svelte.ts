import { browser } from '$app/environment';
import { db, seedIfEmpty, type Product } from '$lib/db';

let _products = $state<Product[]>([]);
let _loaded = $state(false);

export const products = {
  get all() { return _products; },
  get active() { return _products.filter((p) => p.isActive); },
  get loaded() { return _loaded; },

  async load() {
    if (!browser) return;
    await seedIfEmpty();
    _products = await db.products.toArray();
    _loaded = true;
  },

  async add(p: Omit<Product, 'id'>) {
    const id = await db.products.add(p);
    _products = [..._products, { ...p, id }];
  },

  async update(id: number, patch: Partial<Product>) {
    await db.products.update(id, patch);
    _products = _products.map((p) => (p.id === id ? { ...p, ...patch } : p));
  },

  async remove(id: number) {
    await db.products.delete(id);
    _products = _products.filter((p) => p.id !== id);
  },
};
