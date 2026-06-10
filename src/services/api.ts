import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const TOKEN_KEY = '@popup_auth_token';

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setStoredToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: { skipAuth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!options.skipAuth) {
    const token = await getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    await clearStoredToken();
    throw new Error('Unauthorized - please log in again');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),

  auth: {
    register: (data: { email: string; name: string; password: string }) =>
      request<{ token: string; user: { id: string; email: string; name: string } }>(
        'POST', '/api/auth/register', data, { skipAuth: true }
      ),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: { id: string; email: string; name: string } }>(
        'POST', '/api/auth/login', data, { skipAuth: true }
      ),
    me: () => request<{ user: { id: string; email: string; name: string } }>('GET', '/api/auth/me'),
  },

  events: {
    create: (data: { name: string; location: string; date: string; commissionRate?: number; maxStands?: number; planType?: string }) =>
      request<{ event: any }>('POST', '/api/events', data),
    getById: (id: string) => request<{ event: any }>('GET', `/api/events/${id}`),
    getMy: () => request<{ events: any[] }>('GET', '/api/events/my'),
    join: (data: { accessCode: string; standName: string; standCost?: number; inventoryCost?: number }) =>
      request<{ event: any; stand: any }>('POST', '/api/events/join', data),
    getDashboard: (id: string) => request<{ event: any; stands: any[]; summary: any }>('GET', `/api/events/${id}/dashboard`),
  },

  stands: {
    getById: (id: string) => request<{ stand: any; event: any; cashiers: any[]; products: any[] }>('GET', `/api/stands/${id}`),
    update: (id: string, data: Partial<{ name: string; standCost: number; inventoryCost: number }>) =>
      request<{ stand: any }>('PUT', `/api/stands/${id}`, data),
    getStats: (id: string) => request<{ stats: any; recentTransactions: any[] }>('GET', `/api/stands/${id}/stats`),
    addCashier: (id: string, data: { name: string; pin: string }) =>
      request<{ cashier: any }>('POST', `/api/stands/${id}/cashiers`, data),
    removeCashier: (standId: string, cashierId: string) =>
      request<{ success: boolean }>('DELETE', `/api/stands/${standId}/cashiers/${cashierId}`),
    getPanic: (id: string) => request<any>('GET', `/api/stands/${id}/panic`),
  },

  products: {
    getByStand: (standId: string) => request<{ products: any[] }>('GET', `/api/stands/${standId}/products`),
    create: (standId: string, data: { name: string; price: number; costPrice: number; emoji?: string; stock?: number }) =>
      request<{ product: any }>('POST', `/api/stands/${standId}/products`, data),
    update: (id: string, data: Partial<{ name: string; price: number; costPrice: number; emoji: string; stock: number }>) =>
      request<{ product: any }>('PUT', `/api/products/${id}`, data),
    delete: (id: string) => request<{ success: boolean }>('DELETE', `/api/products/${id}`),
    reorder: (productIds: string[]) =>
      request<{ success: boolean }>('PUT', '/api/products/reorder', { productIds }),
  },

  transactions: {
    create: (data: {
      standId: string;
      productId?: string;
      productName: string;
      quantity: number;
      originalPrice: number;
      salePrice: number;
      costPrice: number;
      cashierId?: string;
      cashierName?: string;
      isCombo?: boolean;
      comboDescription?: string;
      notes?: string;
      discountAmount?: number;
    }) => request<{ transaction: any }>('POST', '/api/transactions', data),
    getByStand: (standId: string, params?: { limit?: number; offset?: number }) => {
      const query = params ? `?limit=${params.limit || 50}&offset=${params.offset || 0}` : '';
      return request<{ transactions: any[]; total: number }>('GET', `/api/transactions/stands/${standId}/transactions${query}`);
    },
    void: (id: string) => request<{ success: boolean }>('DELETE', `/api/transactions/${id}`),
  },

  exports: {
    standCsv: (standId: string) => `${API_BASE_URL}/api/stands/${standId}/export/csv`,
    eventCsv: (eventId: string) => `${API_BASE_URL}/api/events/${eventId}/export/csv`,
    standSummary: (standId: string) => request<any>('GET', `/api/stands/${standId}/export/summary`),
  },
};
