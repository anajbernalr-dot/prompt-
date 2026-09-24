import type { PlaceCategory } from '@/data/types';

export type ExploreCat = 'todo' | 'cafe' | 'comer' | 'bebidas' | 'eventos';

export const exploreCats: readonly { key: ExploreCat; label: string }[] = [
  { key: 'todo', label: 'Todo' },
  { key: 'cafe', label: 'Café' },
  { key: 'comer', label: 'Comer' },
  { key: 'bebidas', label: 'Bebidas' },
  { key: 'eventos', label: 'Eventos' },
];

export const placeCategoryFor: Partial<Record<ExploreCat, PlaceCategory>> = {
  cafe: 'cafe',
  comer: 'restaurante',
  bebidas: 'bar',
};

/** Lowercase and strip accents so "cafe" finds "Café" and "avila" finds "Ávila". */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Every word of the (normalized) query must appear in at least one field. */
export function matches(normalizedQuery: string, fields: readonly (string | undefined)[]): boolean {
  if (!normalizedQuery) return true;
  const haystack = fields.filter(Boolean).map((f) => normalize(f as string));
  return normalizedQuery
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.some((f) => f.includes(word)));
}

/** Accepts the chip keys plus friendly aliases coming from other screens (?cat=bar, ?cat=restaurante…). */
export function parseExploreCat(raw?: string | string[]): ExploreCat {
  const value = normalize(Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? ''));
  if (['cafe', 'cafes', 'cafeteria'].includes(value)) return 'cafe';
  if (['comer', 'comida', 'restaurante', 'restaurantes'].includes(value)) return 'comer';
  if (['bebidas', 'bebida', 'bar', 'bares', 'tragos'].includes(value)) return 'bebidas';
  if (['eventos', 'evento', 'events'].includes(value)) return 'eventos';
  return 'todo';
}

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
