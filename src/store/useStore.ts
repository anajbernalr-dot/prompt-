import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setStoredToken, clearStoredToken, getStoredToken } from '../services/api';
import { wsService } from '../services/websocket';

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
  email?: string;
}

interface AppState {
  // Auth
  authToken: string | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // App state
  currentEvent: Event | null;
  currentStand: Stand | null;
  userRole: 'organizer' | 'stand' | null;
  plan: 'free' | 'premium';
  activeCashier: Cashier | null;
  currentCashier: Cashier | null;

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setError: (error: string | null) => void;

  // Legacy / local state setters
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
  }) => Promise<string>;
  joinEvent: (code: string, standName?: string, standCost?: number, inventoryCost?: number) => Promise<boolean>;
  leaveEvent: () => void;

  // Stand
  setupStand: (name: string, standCost: number) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  refreshStandData: () => Promise<void>;

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
  }) => Promise<void>;
  registerComboSale: (items: Array<{ product: Product; quantity: number }>, totalPrice: number) => Promise<void>;
  voidTransaction: (transactionId: string) => Promise<void>;

  // Cashier
  addCashier: (cashier: Omit<Cashier, 'id'>) => Promise<void>;
  removeCashier: (cashierId: string) => Promise<void>;
  setActiveCashier: (cashier: Cashier | null) => void;

  // Reset
  resetAll: () => void;
}

function mapApiTransaction(t: any): Transaction {
  return {
    id: t.id,
    productId: t.product_id || 'unknown',
    productName: t.product_name,
    quantity: t.quantity,
    originalPrice: t.original_price,
    salePrice: t.sale_price,
    discount: t.discount_amount || 0,
    costPrice: t.cost_price,
    netMargin: t.net_margin,
    timestamp: new Date(t.created_at),
    cashierId: t.cashier_name || 'Principal',
    isCombo: t.is_combo === 1,
    comboItems: t.combo_description ? t.combo_description.split(', ') : undefined,
  };
}

function mapApiProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    emoji: p.emoji || '🛍️',
    price: p.price,
    costPrice: p.cost_price,
    stock: p.stock,
  };
}

function mapApiStand(s: any, products: Product[] = [], transactions: Transaction[] = [], cashiers: Cashier[] = []): Stand {
  return {
    id: s.id,
    name: s.name,
    ownerId: s.owner_id,
    products,
    transactions,
    standCost: s.stand_cost,
    inventoryCost: s.inventory_cost,
    cashiers,
  };
}

function mapApiEvent(e: any): Event {
  return {
    id: e.id,
    name: e.name,
    location: e.location,
    date: e.date,
    accessCode: e.access_code,
    commissionRate: e.commission_rate,
    organizerId: e.organizer_id,
    stands: [],
    maxStands: e.max_stands,
    planType: (e.plan_type as any) || 'starter',
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      authToken: null,
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      currentEvent: null,
      currentStand: null,
      userRole: null,
      plan: 'free',
      activeCashier: null,
      currentCashier: null,

      setError: (error) => set({ error }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await api.auth.login({ email, password });
          await setStoredToken(token);
          set({
            authToken: token,
            currentUser: { id: user.id, name: user.name, email: user.email },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Login failed' });
          throw err;
        }
      },

      register: async (email, name, password) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await api.auth.register({ email, name, password });
          await setStoredToken(token);
          set({
            authToken: token,
            currentUser: { id: user.id, name: user.name, email: user.email },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Registration failed' });
          throw err;
        }
      },

      logout: async () => {
        await clearStoredToken();
        wsService.disconnect();
        set({
          authToken: null,
          currentUser: null,
          isAuthenticated: false,
          currentEvent: null,
          currentStand: null,
          userRole: null,
          activeCashier: null,
          currentCashier: null,
        });
      },

      restoreSession: async () => {
        set({ isLoading: true });
        try {
          const token = await getStoredToken();
          if (!token) {
            set({ isLoading: false });
            return;
          }
          const { user } = await api.auth.me();
          set({
            authToken: token,
            currentUser: { id: user.id, name: user.name, email: user.email },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          await clearStoredToken();
          set({ isLoading: false, isAuthenticated: false, authToken: null, currentUser: null });
        }
      },

      setCurrentUser: (user) => set({ currentUser: user }),
      setUserRole: (role) => set({ userRole: role }),

      createEvent: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { event } = await api.events.create({
            name: data.name,
            location: data.location,
            date: data.date,
            commissionRate: data.commissionRate,
            maxStands: data.maxStands,
            planType: data.planType,
          });
          const mappedEvent = mapApiEvent(event);
          set({
            currentEvent: mappedEvent,
            userRole: 'organizer',
            isLoading: false,
          });
          // Connect WS to event room
          wsService.connect(event.access_code);
          return event.access_code;
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Failed to create event' });
          throw err;
        }
      },

      joinEvent: async (code, standName = 'Mi Puesto', standCost = 0, inventoryCost = 0) => {
        set({ isLoading: true, error: null });
        try {
          const { event, stand } = await api.events.join({
            accessCode: code,
            standName,
            standCost,
            inventoryCost,
          });

          // Load products for this stand
          const { products: rawProducts } = await api.products.getByStand(stand.id);
          const products = rawProducts.map(mapApiProduct);

          // Load transactions
          const { transactions: rawTxs } = await api.transactions.getByStand(stand.id);
          const transactions = rawTxs.map(mapApiTransaction);

          // Load cashiers
          const { cashiers } = await api.stands.getById(stand.id);

          const mappedStand = mapApiStand(stand, products, transactions, cashiers);
          const mappedEvent = mapApiEvent(event);

          set({
            currentEvent: mappedEvent,
            currentStand: mappedStand,
            userRole: 'stand',
            isLoading: false,
          });
          wsService.connect(event.access_code);
          return true;
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Failed to join event' });
          return false;
        }
      },

      leaveEvent: () => {
        wsService.disconnect();
        set({ currentEvent: null, currentStand: null, userRole: null });
      },

      setupStand: async (name, standCost) => {
        const { currentEvent, currentUser } = get();
        if (!currentEvent || !currentUser) return;

        set({ isLoading: true, error: null });
        try {
          // If we already have a stand (from joinEvent), just update it
          const existingStand = get().currentStand;
          if (existingStand) {
            const { stand } = await api.stands.update(existingStand.id, { name, standCost });
            set({
              currentStand: { ...existingStand, name: stand.name, standCost: stand.stand_cost },
              isLoading: false,
            });
            return;
          }

          // Otherwise join event to create stand (only in free mode scenario)
          const { event, stand } = await api.events.join({
            accessCode: currentEvent.accessCode,
            standName: name,
            standCost,
          });

          const mappedStand = mapApiStand(stand, [], [], []);
          const mappedEvent = mapApiEvent(event);

          set({
            currentEvent: mappedEvent,
            currentStand: mappedStand,
            isLoading: false,
          });
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Failed to setup stand' });
        }
      },

      addProduct: async (productData) => {
        const { currentStand } = get();
        if (!currentStand) return;

        set({ isLoading: true, error: null });
        try {
          const { product } = await api.products.create(currentStand.id, {
            name: productData.name,
            price: productData.price,
            costPrice: productData.costPrice,
            emoji: productData.emoji,
            stock: productData.stock,
          });
          const mappedProduct = mapApiProduct(product);
          const inventoryCost = currentStand.inventoryCost + product.cost_price * product.stock;
          set({
            currentStand: {
              ...currentStand,
              products: [...currentStand.products, mappedProduct],
              inventoryCost,
            },
            isLoading: false,
          });
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Failed to add product' });
        }
      },

      updateProduct: async (productId, updates) => {
        const { currentStand } = get();
        if (!currentStand) return;

        try {
          const apiUpdates: any = {};
          if (updates.name !== undefined) apiUpdates.name = updates.name;
          if (updates.price !== undefined) apiUpdates.price = updates.price;
          if (updates.costPrice !== undefined) apiUpdates.costPrice = updates.costPrice;
          if (updates.emoji !== undefined) apiUpdates.emoji = updates.emoji;
          if (updates.stock !== undefined) apiUpdates.stock = updates.stock;

          const { product } = await api.products.update(productId, apiUpdates);
          const mappedProduct = mapApiProduct(product);

          const products = currentStand.products.map(p => p.id === productId ? mappedProduct : p);
          const inventoryCost = products.reduce((s, p) => s + p.costPrice * p.stock, 0);
          set({ currentStand: { ...currentStand, products, inventoryCost } });
        } catch (err: any) {
          set({ error: err.message || 'Failed to update product' });
        }
      },

      removeProduct: async (productId) => {
        const { currentStand } = get();
        if (!currentStand) return;

        try {
          await api.products.delete(productId);
          const products = currentStand.products.filter(p => p.id !== productId);
          const inventoryCost = products.reduce((s, p) => s + p.costPrice * p.stock, 0);
          set({ currentStand: { ...currentStand, products, inventoryCost } });
        } catch (err: any) {
          set({ error: err.message || 'Failed to remove product' });
        }
      },

      refreshStandData: async () => {
        const { currentStand } = get();
        if (!currentStand) return;

        try {
          const { stand, products: rawProducts, cashiers } = await api.stands.getById(currentStand.id);
          const products = rawProducts.map(mapApiProduct);
          const { transactions: rawTxs } = await api.transactions.getByStand(currentStand.id);
          const transactions = rawTxs.map(mapApiTransaction);

          const mappedStand = mapApiStand(stand, products, transactions, cashiers);
          set({ currentStand: mappedStand });
        } catch (err: any) {
          set({ error: err.message || 'Failed to refresh data' });
        }
      },

      registerSale: async (sale) => {
        const { currentStand, activeCashier, currentEvent } = get();
        if (!currentStand || !currentEvent) return;

        const netMargin = (sale.salePrice - sale.costPrice) * sale.quantity;
        const localTx: Transaction = {
          id: 'temp-' + Date.now(),
          productId: sale.productId,
          productName: sale.productName,
          quantity: sale.quantity,
          originalPrice: sale.originalPrice,
          salePrice: sale.salePrice,
          discount: sale.discount,
          costPrice: sale.costPrice,
          netMargin,
          timestamp: new Date(),
          cashierId: activeCashier?.name ?? 'Principal',
          isCombo: sale.isCombo,
          comboItems: sale.comboItems,
        };

        // Optimistic update
        const products = currentStand.products.map(p => {
          if (p.id === sale.productId) {
            return { ...p, stock: Math.max(0, p.stock - sale.quantity) };
          }
          return p;
        });
        set({
          currentStand: {
            ...currentStand,
            products,
            transactions: [localTx, ...currentStand.transactions],
          }
        });

        try {
          const { transaction } = await api.transactions.create({
            standId: currentStand.id,
            productId: sale.productId !== 'combo' ? sale.productId : undefined,
            productName: sale.productName,
            quantity: sale.quantity,
            originalPrice: sale.originalPrice,
            salePrice: sale.salePrice,
            costPrice: sale.costPrice,
            cashierName: activeCashier?.name,
            isCombo: sale.isCombo,
            discountAmount: sale.discount,
          });

          // Replace temp with real
          const realTx = mapApiTransaction(transaction);
          set(state => ({
            currentStand: state.currentStand ? {
              ...state.currentStand,
              transactions: state.currentStand.transactions.map(t =>
                t.id === localTx.id ? realTx : t
              )
            } : null
          }));

          // Broadcast to WS room
          wsService.send({
            type: 'sale_recorded',
            roomCode: currentEvent.accessCode,
            data: { standId: currentStand.id, transaction: realTx },
          });
        } catch (err: any) {
          // Keep optimistic update, queue for later sync
          set({ error: err.message || 'Transaction saved offline' });
        }
      },

      registerComboSale: async (items, totalPrice) => {
        const { currentStand, activeCashier, currentEvent } = get();
        if (!currentStand || !currentEvent) return;

        const totalCost = items.reduce((s, i) => s + i.product.costPrice * i.quantity, 0);
        const comboItems = items.map(i => i.product.name);
        const comboDescription = comboItems.join(', ');
        const originalPrice = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

        const localTx: Transaction = {
          id: 'temp-combo-' + Date.now(),
          productId: 'combo',
          productName: `Combo (${comboDescription})`,
          quantity: 1,
          originalPrice,
          salePrice: totalPrice,
          discount: 0,
          costPrice: totalCost,
          netMargin: totalPrice - totalCost,
          timestamp: new Date(),
          cashierId: activeCashier?.name ?? 'Principal',
          isCombo: true,
          comboItems,
        };

        const products = currentStand.products.map(p => {
          const item = items.find(i => i.product.id === p.id);
          if (item) return { ...p, stock: Math.max(0, p.stock - item.quantity) };
          return p;
        });
        set({
          currentStand: {
            ...currentStand,
            products,
            transactions: [localTx, ...currentStand.transactions],
          }
        });

        try {
          const { transaction } = await api.transactions.create({
            standId: currentStand.id,
            productName: `Combo (${comboDescription})`,
            quantity: 1,
            originalPrice,
            salePrice: totalPrice,
            costPrice: totalCost,
            cashierName: activeCashier?.name,
            isCombo: true,
            comboDescription,
          });

          const realTx = mapApiTransaction(transaction);
          set(state => ({
            currentStand: state.currentStand ? {
              ...state.currentStand,
              transactions: state.currentStand.transactions.map(t =>
                t.id === localTx.id ? realTx : t
              )
            } : null
          }));

          wsService.send({
            type: 'sale_recorded',
            roomCode: currentEvent.accessCode,
            data: { standId: currentStand.id, transaction: realTx },
          });
        } catch (err: any) {
          set({ error: err.message || 'Combo saved offline' });
        }
      },

      voidTransaction: async (transactionId) => {
        const { currentStand } = get();
        if (!currentStand) return;

        try {
          await api.transactions.void(transactionId);
          const transactions = currentStand.transactions.filter(t => t.id !== transactionId);
          set({ currentStand: { ...currentStand, transactions } });
        } catch (err: any) {
          set({ error: err.message || 'Failed to void transaction' });
        }
      },

      addCashier: async (cashierData) => {
        const { currentStand } = get();
        if (!currentStand) return;

        try {
          const { cashier } = await api.stands.addCashier(currentStand.id, {
            name: cashierData.name,
            pin: cashierData.pin,
          });
          set({
            currentStand: {
              ...currentStand,
              cashiers: [...currentStand.cashiers, { id: cashier.id, name: cashier.name, pin: cashier.pin }],
            },
          });
        } catch (err: any) {
          set({ error: err.message || 'Failed to add cashier' });
        }
      },

      removeCashier: async (cashierId) => {
        const { currentStand } = get();
        if (!currentStand) return;

        try {
          await api.stands.removeCashier(currentStand.id, cashierId);
          set({
            currentStand: {
              ...currentStand,
              cashiers: currentStand.cashiers.filter(c => c.id !== cashierId),
            },
          });
        } catch (err: any) {
          set({ error: err.message || 'Failed to remove cashier' });
        }
      },

      setActiveCashier: (cashier) => set({ activeCashier: cashier, currentCashier: cashier }),

      resetAll: () => {
        wsService.disconnect();
        set({
          currentUser: null,
          currentEvent: null,
          currentStand: null,
          userRole: null,
          activeCashier: null,
          currentCashier: null,
          isAuthenticated: false,
          authToken: null,
        });
      },
    }),
    {
      name: 'popup-analytics-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        authToken: state.authToken,
        currentUser: state.currentUser,
        currentEvent: state.currentEvent,
        currentStand: state.currentStand,
        userRole: state.userRole,
        activeCashier: state.activeCashier,
      }),
    }
  )
);
