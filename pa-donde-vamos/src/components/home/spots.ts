import type { ImageSourcePropType } from 'react-native';

import { events } from '@/data/events';
import { eventImage, placeImage } from '@/data/images';
import { places } from '@/data/places';
import type { AppEvent, Place, PlaceCategory } from '@/data/types';
import { formatDateTime, formatKm } from '@/lib/format';

export type FilterKey = 'todo' | 'cafe' | 'comer' | 'bebidas' | 'eventos';

export const FILTERS: readonly { key: FilterKey; label: string }[] = [
  { key: 'todo', label: 'Todo' },
  { key: 'cafe', label: 'Café' },
  { key: 'comer', label: 'Comer' },
  { key: 'bebidas', label: 'Bebidas' },
  { key: 'eventos', label: 'Eventos' },
];

export const FILTER_CATEGORY: Record<FilterKey, PlaceCategory | null> = {
  todo: null,
  cafe: 'cafe',
  comer: 'restaurante',
  bebidas: 'bar',
  eventos: null,
};

/** A place or an event, normalized for cards, pins and previews. */
export type Spot = {
  kind: 'place' | 'event';
  id: string;
  name: string;
  /** "Cafetería · La Castellana" / "Música · La Candelaria" */
  meta: string;
  image: ImageSourcePropType | undefined;
  distanceKm: number;
  map: { x: number; y: number };
  href: string;
  place?: Place;
  event?: AppEvent;
};

export function placeSpot(p: Place): Spot {
  return {
    kind: 'place',
    id: p.id,
    name: p.name,
    meta: `${p.categoryLabel} · ${p.zone}`,
    image: placeImage(p.image),
    distanceKm: p.distanceKm,
    map: p.map,
    href: `/place/${p.id}`,
    place: p,
  };
}

export function eventSpot(e: AppEvent): Spot {
  return {
    kind: 'event',
    id: e.id,
    name: e.title,
    meta: `${e.category} · ${e.zone}`,
    image: eventImage(e.image),
    distanceKm: e.distanceKm,
    map: e.map,
    href: `/event/${e.id}`,
    event: e,
  };
}

/** Subtitle used on hero cards: "Cafetería · La Castellana · 1.4 km" or "Vie, 25 sep · 7:30 pm · Parque del Este". */
export function spotSubtitle(s: Spot): string {
  if (s.event) return `${formatDateTime(s.event.date)} · ${s.event.zone}`;
  return `${s.meta} · ${formatKm(s.distanceKm)}`;
}

const byDate = (a: AppEvent, b: AppEvent) => a.date.localeCompare(b.date);
const byRating = (a: Place, b: Place) => b.rating - a.rating || b.reviews - a.reviews;

export const eventsByDate = () => [...events].sort(byDate);

/** Places + events that match a filter chip. */
export function spotsFor(filter: FilterKey): Spot[] {
  if (filter === 'eventos') return events.map(eventSpot);
  const cat = FILTER_CATEGORY[filter];
  const list = cat ? places.filter((p) => p.category === cat) : places;
  const spots = list.map(placeSpot);
  return filter === 'todo' ? [...spots, ...events.map(eventSpot)] : spots;
}

/** Hero of the Home screen for each chip. */
export function featuredFor(filter: FilterKey): Spot | undefined {
  if (filter === 'eventos') {
    const soonest = eventsByDate()[0];
    return soonest ? eventSpot(soonest) : undefined;
  }
  const cat = FILTER_CATEGORY[filter];
  if (!cat) {
    const featured = places.find((p) => p.featured) ?? places[0];
    return featured ? placeSpot(featured) : undefined;
  }
  const top = places.filter((p) => p.category === cat).sort(byRating)[0];
  return top ? placeSpot(top) : undefined;
}

/** "Cerca de ti": places (or events) sorted by distance, without the hero. */
export function nearbyFor(filter: FilterKey, excludeId?: string): Spot[] {
  const pool =
    filter === 'eventos'
      ? events.map(eventSpot)
      : spotsFor(filter).filter((s) => s.kind === 'place');
  return pool.filter((s) => s.id !== excludeId).sort((a, b) => a.distanceKm - b.distanceKm);
}
