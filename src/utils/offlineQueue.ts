import AsyncStorage from '@react-native-async-storage/async-storage';
import { transactionsApi } from '../services/api';

const QUEUE_KEY = '@popup_offline_queue';

export interface QueuedTransaction {
  id: string;
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
  timestamp: number;
}

export async function getQueue(): Promise<QueuedTransaction[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function enqueue(transaction: QueuedTransaction): Promise<void> {
  const queue = await getQueue();
  queue.push(transaction);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function dequeue(id: string): Promise<void> {
  const queue = await getQueue();
  const filtered = queue.filter(t => t.id !== id);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

export async function syncQueue(onProgress?: (synced: number, total: number) => void): Promise<{ synced: number; failed: number }> {
  const queue = await getQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      await transactionsApi.create({
        standId: item.standId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        originalPrice: item.originalPrice,
        salePrice: item.salePrice,
        costPrice: item.costPrice,
        cashierId: item.cashierId,
        cashierName: item.cashierName,
        isCombo: item.isCombo,
        comboDescription: item.comboDescription,
        notes: item.notes,
      });
      await dequeue(item.id);
      synced++;
      onProgress?.(synced, queue.length);
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}

export async function isOnline(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3001/health', { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}
