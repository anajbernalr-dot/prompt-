import Dexie, { type EntityTable } from 'dexie';

export interface Sale {
  id?: number;
  productId: number;
  productName: string;
  emoji: string;
  originalPrice: number;
  finalPrice: number;
  discountPct: number;
  cost: number;
  timestamp: Date;
  roomCode: string;
}

export interface Product {
  id?: number;
  name: string;
  emoji: string;
  price: number;
  cost: number;
  isActive: boolean;
}

export interface Room {
  id?: number;
  code: string;
  eventName: string;
  breakEvenTarget: number;
  festivalFeePct: number;
  isOrganizer: boolean;
  joinedAt: Date;
}

export const db = new Dexie('popup-analytics') as Dexie & {
  sales: EntityTable<Sale, 'id'>;
  products: EntityTable<Product, 'id'>;
  rooms: EntityTable<Room, 'id'>;
};

db.version(1).stores({
  sales: '++id, productId, timestamp, roomCode',
  products: '++id, name, isActive',
  rooms: '++id, code',
});

const SEED_PRODUCTS: Omit<Product, 'id'>[] = [
  { name: 'Taco Carnitas', emoji: '🌮', price: 3.5, cost: 1.2, isActive: true },
  { name: 'Elote en Vaso', emoji: '🌽', price: 2.5, cost: 0.8, isActive: true },
  { name: 'Agua Jamaica', emoji: '🥤', price: 1.5, cost: 0.4, isActive: true },
  { name: 'Quesadilla', emoji: '🫓', price: 4.0, cost: 1.5, isActive: true },
  { name: 'Nachos XL', emoji: '🧀', price: 5.0, cost: 1.8, isActive: true },
  { name: 'Churros x3', emoji: '🍩', price: 2.0, cost: 0.6, isActive: true },
];

export async function seedIfEmpty(): Promise<void> {
  const count = await db.products.count();
  if (count === 0) {
    await db.products.bulkAdd(SEED_PRODUCTS);
  }
}
