import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { generateEventCode } from '../utils/codeGenerator';

export interface Product {
  id: string;
  name: string;
  emoji: string;
  price: number;
  costPrice: number;
  stock: number;
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  originalPrice: number;
  salePrice: number;
  discount: number;
  costPrice: number;
  netMargin: number;
  timestamp: Date;
  cashierId: string;
  isCombo: boolean;
  comboItems?: string[];
}

export interface Cashier {
  id: string;
  name: string;
  pin: string;
}

export interface Stand {
  id: string;
  name: string;
  ownerId: string;
  products: Product[];
  transactions: Transaction[];
  standCost: number;
  inventoryCost: number;
  cashiers: Cashier[];
}

export interface Event {
  id: string;
  name: string;
  location: string;
  date: string;
  accessCode: string;
  commissionRate: number;
  organizerId: string;
  stands: Stand[];
  maxStands: number;
  planType: 'starter' | 'growth' | 'macro';
}

export interface User {
  id: string;
  name: string;
}

interface AppState {
  currentUser: User | null;
  currentEvent: Event | null;
  currentStand: Stand | null;
  userRole: 'organizer' | 'stand' | null;
  plan: 'free' | 'premium';
  activeCashier: Cashier | null;

  // Auth / setup
  setCurrentUser: (user: User) => void;
  setUserRole: (role: 'organizer' | 'stand') => void;

  // Event
  createEvent: (data: {
    name: string;
    location: string;
    date: string;
    maxStands: number;
    commissionRate: number;
    standCost: number;
    planType: 'starter' | 'growth' | 'macro';
  }) => string;
  joinEvent: (code: string) => boolean;
  leaveEvent: () => void;

  // Stand
  setupStand: (name: string, standCost: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  removeProduct: (productId: string) => void;

  // Transactions
  registerSale: (sale: {
    productId: string;
    productName: string;
    quantity: number;
    originalPrice: number;
    salePrice: number;
    discount: number;
    costPrice: number;
    isCombo: boolean;
    comboItems?: string[];
  }) => void;
  registerComboSale: (items: Array<{ product: Product; quantity: number }>, totalPrice: number) => void;

  // Cashier
  addCashier: (cashier: Omit<Cashier, 'id'>) => void;
  removeCashier: (cashierId: string) => void;
  setActiveCashier: (cashier: Cashier | null) => void;

  // Reset
  resetAll: () => void;
}

const DEFAULT_USER: User = { id: uuidv4(), name: 'Usuario' };

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      currentEvent: null,
      currentStand: null,
      userRole: null,
      plan: 'free',
      activeCashier: null,

      setCurrentUser: (user) => set({ currentUser: user }),
      setUserRole: (role) => set({ userRole: role }),

      createEvent: (data) => {
        const user = get().currentUser ?? DEFAULT_USER;
        const code = generateEventCode();
        const event: Event = {
          id: uuidv4(),
          name: data.name,
          location: data.location,
          date: data.date,
          accessCode: code,
          commissionRate: data.commissionRate,
          organizerId: user.id,
          stands: [],
          maxStands: data.maxStands,
          planType: data.planType,
        };
        set({ currentEvent: event, userRole: 'organizer', currentUser: user });
        return code;
      },

      joinEvent: (code) => {
        const { currentEvent } = get();
        // In a real app this would hit an API; here we simulate offline
        // If the user is the organizer of this event, allow join
        if (currentEvent && currentEvent.accessCode === code) {
          set({ userRole: 'stand' });
          return true;
        }
        // Free mode: create a local pseudo-event
        if (code === 'FREE') {
          const freeEvent: Event = {
            id: uuidv4(),
            name: 'Modo Libre',
            location: 'Local',
            date: new Date().toISOString().split('T')[0],
            accessCode: 'FREE',
            commissionRate: 0,
            organizerId: 'free',
            stands: [],
            maxStands: 1,
            planType: 'starter',
          };
          set({ currentEvent: freeEvent, userRole: 'stand' });
          return true;
        }
        return false;
      },

      leaveEvent: () => {
        set({ currentEvent: null, currentStand: null, userRole: null });
      },

      setupStand: (name, standCost) => {
        const user = get().currentUser ?? DEFAULT_USER;
        const stand: Stand = {
          id: uuidv4(),
          name,
          ownerId: user.id,
          products: [],
          transactions: [],
          standCost,
          inventoryCost: 0,
          cashiers: [],
        };
        set((state) => {
          const event = state.currentEvent;
          if (event) {
            const updatedStands = [...event.stands, stand];
            return {
              currentStand: stand,
              currentUser: user,
              currentEvent: { ...event, stands: updatedStands },
            };
          }
          return { currentStand: stand, currentUser: user };
        });
      },

      addProduct: (productData) => {
        const product: Product = { ...productData, id: uuidv4() };
        set((state) => {
          if (!state.currentStand) return {};
          const inventoryCost = state.currentStand.inventoryCost + product.costPrice * product.stock;
          const updatedStand: Stand = {
            ...state.currentStand,
            products: [...state.currentStand.products, product],
            inventoryCost,
          };
          return { currentStand: updatedStand };
        });
      },

      updateProduct: (productId, updates) => {
        set((state) => {
          if (!state.currentStand) return {};
          const products = state.currentStand.products.map((p) =>
            p.id === productId ? { ...p, ...updates } : p
          );
          const inventoryCost = products.reduce((s, p) => s + p.costPrice * p.stock, 0);
          return { currentStand: { ...state.currentStand, products, inventoryCost } };
        });
      },

      removeProduct: (productId) => {
        set((state) => {
          if (!state.currentStand) return {};
          const products = state.currentStand.products.filter((p) => p.id !== productId);
          const inventoryCost = products.reduce((s, p) => s + p.costPrice * p.stock, 0);
          return { currentStand: { ...state.currentStand, products, inventoryCost } };
        });
      },

      registerSale: (sale) => {
        const cashier = get().activeCashier;
        const netMargin = (sale.salePrice - sale.costPrice) * sale.quantity;
        const transaction: Transaction = {
          ...sale,
          id: uuidv4(),
          netMargin,
          timestamp: new Date(),
          cashierId: cashier?.name ?? 'Principal',
        };
        set((state) => {
          if (!state.currentStand) return {};
          // Deduct stock
          const products = state.currentStand.products.map((p) => {
            if (p.id === sale.productId) {
              return { ...p, stock: Math.max(0, p.stock - sale.quantity) };
            }
            return p;
          });
          const updatedStand: Stand = {
            ...state.currentStand,
            products,
            transactions: [transaction, ...state.currentStand.transactions],
          };
          // Also update event stands
          if (state.currentEvent) {
            const updatedStands = state.currentEvent.stands.map((s) =>
              s.id === updatedStand.id ? updatedStand : s
            );
            return {
              currentStand: updatedStand,
              currentEvent: { ...state.currentEvent, stands: updatedStands },
            };
          }
          return { currentStand: updatedStand };
        });
      },

      registerComboSale: (items, totalPrice) => {
        const cashier = get().activeCashier;
        const totalCost = items.reduce((s, i) => s + i.product.costPrice * i.quantity, 0);
        const comboItems = items.map((i) => i.product.name);
        const transaction: Transaction = {
          id: uuidv4(),
          productId: 'combo',
          productName: `Combo (${comboItems.join(', ')})`,
          quantity: 1,
          originalPrice: items.reduce((s, i) => s + i.product.price * i.quantity, 0),
          salePrice: totalPrice,
          discount: 0,
          costPrice: totalCost,
          netMargin: totalPrice - totalCost,
          timestamp: new Date(),
          cashierId: cashier?.name ?? 'Principal',
          isCombo: true,
          comboItems,
        };
        set((state) => {
          if (!state.currentStand) return {};
          const products = state.currentStand.products.map((p) => {
            const item = items.find((i) => i.product.id === p.id);
            if (item) return { ...p, stock: Math.max(0, p.stock - item.quantity) };
            return p;
          });
          const updatedStand: Stand = {
            ...state.currentStand,
            products,
            transactions: [transaction, ...state.currentStand.transactions],
          };
          if (state.currentEvent) {
            const updatedStands = state.currentEvent.stands.map((s) =>
              s.id === updatedStand.id ? updatedStand : s
            );
            return {
              currentStand: updatedStand,
              currentEvent: { ...state.currentEvent, stands: updatedStands },
            };
          }
          return { currentStand: updatedStand };
        });
      },

      addCashier: (cashierData) => {
        const cashier: Cashier = { ...cashierData, id: uuidv4() };
        set((state) => {
          if (!state.currentStand) return {};
          return {
            currentStand: {
              ...state.currentStand,
              cashiers: [...state.currentStand.cashiers, cashier],
            },
          };
        });
      },

      removeCashier: (cashierId) => {
        set((state) => {
          if (!state.currentStand) return {};
          return {
            currentStand: {
              ...state.currentStand,
              cashiers: state.currentStand.cashiers.filter((c) => c.id !== cashierId),
            },
          };
        });
      },

      setActiveCashier: (cashier) => set({ activeCashier: cashier }),

      resetAll: () => {
        set({
          currentUser: null,
          currentEvent: null,
          currentStand: null,
          userRole: null,
          activeCashier: null,
        });
      },
    }),
    {
      name: 'popup-analytics-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
