import type { ImageSourcePropType } from 'react-native';

import { dishImages, galleryImages, placeImage } from './images';
import type { Place, PlaceCategory, Review } from './types';
import { hoursAgo } from '@/lib/format';

export type PhotoCat = 'comida' | 'ambiente' | 'exterior';
/** 'place:<key>' | 'gallery:<key>' | 'dish:<key>' */
export type PhotoRef = string;
export type VenuePhoto = { ref: PhotoRef; cat: PhotoCat };
export type DayHours = { opens: string; closes: string } | null;
export type MenuItem = { name: string; price: string; score: number; likes: number; image: PhotoRef };
export type FriendPost = { id: string; friendId: string; text: string; photo?: PhotoRef; likes: number; comments: number; hoursAgo: number };

export type VenueExtras = {
  phone: string;
  website: string;
  /** Index 0 = domingo … 6 = sábado. */
  week: DayHours[];
  photos: VenuePhoto[];
  menu: MenuItem[];
  posts: FriendPost[];
  gallery: PhotoRef[];
  heroNote: string;
  mapNote: string;
  galleryNote: string;
  wantCount: number;
  reviews: Review[];
};

export function photoSource(ref: PhotoRef): ImageSourcePropType | undefined {
  const [kind, key] = ref.split(':');
  if (kind === 'place') return placeImage(key);
  if (kind === 'dish') return dishImages[key];
  return galleryImages[key];
}

const MENUS: Record<PlaceCategory, MenuItem[]> = {
  cafe: [
    { name: 'Avo Toast', price: '$8.50', score: 9.8, likes: 42, image: 'dish:avo-toast' },
    { name: 'Pancakes', price: '$7.50', score: 9.5, likes: 31, image: 'dish:pancakes' },
    { name: 'Cappuccino', price: '$4.50', score: 9.7, likes: 56, image: 'dish:cappuccino' },
    { name: 'Tostado Especial', price: '$6.50', score: 9.2, likes: 18, image: 'dish:tostado' },
    { name: 'Matcha Latte', price: '$5.50', score: 9.1, likes: 12, image: 'dish:matcha' },
  ],
  restaurante: [
    { name: 'Pargo frito', price: '$22.00', score: 9.7, likes: 48, image: 'dish:pargo' },
    { name: 'Arepa reina pepiada', price: '$7.00', score: 9.5, likes: 39, image: 'dish:arepa' },
    { name: 'Cachapa con queso', price: '$9.50', score: 9.4, likes: 27, image: 'dish:cachapa' },
    { name: 'Tequeños', price: '$6.00', score: 9.3, likes: 33, image: 'dish:tequenos' },
    { name: 'Burger de la casa', price: '$12.00', score: 9.0, likes: 15, image: 'dish:burger' },
  ],
  bar: [
    { name: 'Mojito de parchita', price: '$8.00', score: 9.6, likes: 51, image: 'dish:mojito' },
    { name: 'Cóctel de autor', price: '$10.00', score: 9.4, likes: 29, image: 'dish:cocktail' },
    { name: 'Tequeños', price: '$6.00', score: 9.3, likes: 35, image: 'dish:tequenos' },
    { name: 'Burger de la barra', price: '$11.00', score: 9.0, likes: 17, image: 'dish:burger' },
  ],
};

const PHOTOS: Record<PlaceCategory, VenuePhoto[]> = {
  cafe: [
    { ref: 'gallery:latte-art', cat: 'comida' },
    { ref: 'gallery:pastries', cat: 'comida' },
    { ref: 'gallery:cafe-table', cat: 'ambiente' },
    { ref: 'gallery:facade', cat: 'exterior' },
    { ref: 'dish:avo-toast', cat: 'comida' },
    { ref: 'gallery:terrace', cat: 'exterior' },
    { ref: 'dish:croissant', cat: 'comida' },
    { ref: 'gallery:friends-table', cat: 'ambiente' },
  ],
  restaurante: [
    { ref: 'dish:pargo', cat: 'comida' },
    { ref: 'gallery:friends-table', cat: 'ambiente' },
    { ref: 'dish:arepa', cat: 'comida' },
    { ref: 'gallery:facade', cat: 'exterior' },
    { ref: 'gallery:terrace', cat: 'exterior' },
    { ref: 'dish:cachapa', cat: 'comida' },
    { ref: 'gallery:cafe-table', cat: 'ambiente' },
    { ref: 'dish:tequenos', cat: 'comida' },
  ],
  bar: [
    { ref: 'gallery:bar-counter', cat: 'ambiente' },
    { ref: 'dish:mojito', cat: 'comida' },
    { ref: 'gallery:night-patio', cat: 'exterior' },
    { ref: 'dish:cocktail', cat: 'comida' },
    { ref: 'gallery:friends-table', cat: 'ambiente' },
    { ref: 'gallery:facade', cat: 'exterior' },
    { ref: 'dish:tequenos', cat: 'comida' },
    { ref: 'gallery:terrace', cat: 'ambiente' },
  ],
};

const POSTS: Record<PlaceCategory, Omit<FriendPost, 'id'>[]> = {
  cafe: [
    { friendId: 'anasofi', text: 'El cappuccino aquí es otro nivel 😍', photo: 'gallery:latte-art', likes: 12, comments: 2, hoursAgo: 48 },
    { friendId: 'luisv', text: 'Brunch de campeones. 10/10', photo: 'dish:avo-toast', likes: 9, comments: 1, hoursAgo: 96 },
    { friendId: 'valeria', text: 'Buen ambiente y excelente café', likes: 6, comments: 0, hoursAgo: 170 },
  ],
  restaurante: [
    { friendId: 'carlam', text: 'Ese pargo frito no se discute 🐟', photo: 'dish:pargo', likes: 14, comments: 3, hoursAgo: 30 },
    { friendId: 'diegop', text: 'Cena con los panas, todo espectacular', photo: 'gallery:friends-table', likes: 8, comments: 1, hoursAgo: 80 },
    { friendId: 'mariaf', text: 'El servicio súper atento, volvemos pronto', likes: 5, comments: 0, hoursAgo: 190 },
  ],
  bar: [
    { friendId: 'gabo', text: 'Viernes de mojitos 🍹 ¿quién se anota?', photo: 'dish:mojito', likes: 15, comments: 4, hoursAgo: 20 },
    { friendId: 'sofir', text: 'La terraza de noche es otra cosa', photo: 'gallery:night-patio', likes: 11, comments: 2, hoursAgo: 72 },
    { friendId: 'luisv', text: 'Buena música y mejores tragos', likes: 7, comments: 1, hoursAgo: 160 },
  ],
};

const GALLERY: Record<PlaceCategory, PhotoRef[]> = {
  cafe: ['gallery:latte-art', 'gallery:cafe-table', 'gallery:terrace', 'gallery:friends-table', 'gallery:pastries'],
  restaurante: ['gallery:friends-table', 'dish:pargo', 'gallery:terrace', 'gallery:cafe-table', 'dish:cachapa'],
  bar: ['gallery:bar-counter', 'gallery:night-patio', 'dish:cocktail', 'gallery:friends-table', 'dish:mojito'],
};

const NOTES: Record<PlaceCategory, { hero: string; gallery: string }> = {
  cafe: { hero: 'Café buena gente\nbuen plan', gallery: 'Buen café\nmejores panas' },
  restaurante: { hero: 'Buena comida\nbuen plan', gallery: 'Buena comida\nmejores panas' },
  bar: { hero: 'Buenos tragos\nbuen plan', gallery: 'Buenos tragos\nmejores panas' },
};

const REVIEW_TEXT: Record<PlaceCategory, [string, string, number, number][]> = {
  // [authorId, text, rating, hoursAgo]
  cafe: [
    ['sofir', 'El mejor café de la ciudad, siempre una buena vibra.', 5, 50],
    ['luisv', 'El brunch es otro nivel, el avo toast está brutal.', 4.5, 98],
    ['valeria', 'Buen ambiente, música y atención. Volveré seguro.', 4.5, 175],
    ['lu', 'Los pancakes buenísimos, aunque se llena mucho el finde.', 4, 260],
  ],
  restaurante: [
    ['carlam', 'La comida criolla más sabrosa de la zona. Porciones generosas.', 5, 40],
    ['andres', 'Ambiente muy bonito para una cena tranquila.', 4.5, 110],
    ['diegop', 'Los tequeños y el pargo, obligatorios. Servicio rápido.', 4.5, 200],
    ['rafa', 'Buena música de fondo y la terraza es una nota.', 4, 300],
  ],
  bar: [
    ['gabo', 'Los tragos de autor están increíbles, pidan el de parchita.', 5, 30],
    ['cami', 'Muy buen ambiente, la música en su punto.', 4.5, 90],
    ['sofir', 'Los tequeños para picar son de lo mejor.', 4, 190],
    ['rafa', 'La terraza de noche tiene la mejor vibra de Caracas.', 4.5, 280],
  ],
};

/** Deterministic small number from the id so each venue varies a bit. */
function seed(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997;
  return h;
}

function weekFor(place: Place): DayHours[] {
  const base = { opens: place.opens, closes: place.closes };
  const week: DayHours[] = Array.from({ length: 7 }, () => ({ ...base }));
  if (place.category === 'bar') {
    week[0] = null;
    week[5] = { opens: place.opens, closes: '3:00 am' };
    week[6] = { opens: place.opens, closes: '3:00 am' };
  } else if (place.category === 'cafe') {
    week[0] = { opens: '8:00 am', closes: '6:00 pm' };
  } else {
    week[1] = null;
  }
  return week;
}

const cache = new Map<string, VenueExtras>();

export function getVenueExtras(place: Place): VenueExtras {
  const hit = cache.get(place.id);
  if (hit) return hit;
  const c = place.category;
  const s = seed(place.id);
  const slug = place.name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '');
  const photos: VenuePhoto[] = [{ ref: `place:${place.image}`, cat: 'ambiente' }, ...PHOTOS[c]];
  const extras: VenueExtras = {
    phone: `+58 212 ${String(260 + (s % 700)).padStart(3, '0')} ${String(1000 + ((s * 7) % 9000)).slice(0, 4)}`,
    website: `https://www.${slug}.com.ve`,
    week: weekFor(place),
    photos,
    menu: MENUS[c].map((m, i) => ({ ...m, likes: m.likes + ((s + i * 5) % 9) })),
    posts: POSTS[c].map((p, i) => ({ ...p, id: `${place.id}-post-${i}` })),
    gallery: [`place:${place.image}`, ...GALLERY[c]],
    heroNote: NOTES[c].hero,
    mapNote: `${place.zone}\nsiempre es\nbuena idea`,
    galleryNote: NOTES[c].gallery,
    wantCount: 6 + (s % 12),
    reviews: REVIEW_TEXT[c].map(([authorId, text, rating, h], i) => ({
      id: `vx-${place.id}-${i}`,
      authorId,
      target: { kind: 'place', id: place.id },
      rating,
      reaction: rating >= 4 ? 'love' : rating >= 3 ? 'meh' : 'nope',
      text,
      at: hoursAgo(h),
      likes: 3 + ((s + i * 3) % 11),
    })),
  };
  cache.set(place.id, extras);
  return extras;
}

/** Rough 5→1 star distribution (percentages) consistent with the average rating. */
export function ratingDistribution(rating: number): number[] {
  const top = Math.max(40, Math.min(92, Math.round((rating - 3.6) * 70)));
  const four = Math.max(5, Math.round((100 - top) * 0.6));
  const three = Math.max(1, Math.round((100 - top - four) * 0.55));
  const two = Math.max(0, Math.round((100 - top - four - three) * 0.6));
  const one = Math.max(0, 100 - top - four - three - two);
  return [top, four, three, two, one];
}
