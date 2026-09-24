import type { FilledIconName } from '@/components/Icon';
import { getEvent } from '@/data/events';
import { eventImage, placeImage } from '@/data/images';
import { getPlace } from '@/data/places';
import type { PlaceCategory, PlanCategory, PlanDraft } from '@/data/types';

export const planCategories: {
  key: PlanCategory;
  label: string;
  icon: FilledIconName;
  question: string;
  hint: string;
}[] = [
  {
    key: 'restaurante',
    label: 'Restaurante',
    icon: 'restaurant-outline',
    question: '¿Qué restaurante?',
    hint: 'Escoge dónde van a comer y cuándo.',
  },
  {
    key: 'cafe',
    label: 'Café',
    icon: 'cafe-outline',
    question: '¿Qué café?',
    hint: 'Escoge dónde va a ser el cafecito y cuándo.',
  },
  {
    key: 'bar',
    label: 'Bar',
    icon: 'wine-outline',
    question: '¿Qué bar?',
    hint: 'Escoge dónde se van a tomar algo y cuándo.',
  },
  {
    key: 'evento',
    label: 'Evento',
    icon: 'ticket-outline',
    question: '¿Qué evento?',
    hint: 'Escoge el evento. La fecha y la hora ya vienen incluidas.',
  },
  {
    key: 'otro',
    label: 'Otro',
    icon: 'ellipsis-horizontal-circle-outline',
    question: '¿Qué plan tienes?',
    hint: 'Cuéntanos el plan y, si quieres, dónde va a ser.',
  },
];

export const categoryMeta = (key?: PlanCategory) => planCategories.find((c) => c.key === key);

export const isPlaceCategory = (key?: PlanCategory): key is PlaceCategory =>
  key === 'restaurante' || key === 'cafe' || key === 'bar';

/** Category implied by a draft that was started elsewhere (e.g. "Armar un plan aquí"). */
export function inferCategory(draft: PlanDraft): PlanCategory | undefined {
  if (draft.category) return draft.category;
  if (draft.eventId && getEvent(draft.eventId)) return 'evento';
  const place = getPlace(draft.placeId);
  if (place) return place.category;
  if (draft.title) return 'otro';
  return undefined;
}

/** Draft has something to go to (place, event or a custom title). */
export const draftHasTarget = (draft: PlanDraft) =>
  !!(getPlace(draft.placeId) || getEvent(draft.eventId) || draft.title?.trim());

type Target = { placeId?: string; eventId?: string; title?: string };

/** Display name, photo, location line and coordinates of whatever a plan/draft points to. */
export function describeTarget(t: Target) {
  const place = getPlace(t.placeId);
  const event = place ? undefined : getEvent(t.eventId);
  const custom = t.title?.trim();
  return {
    place,
    event,
    name: custom && !event ? custom : (event?.title ?? place?.name ?? custom ?? 'Plan'),
    image: place ? placeImage(place.image) : event ? eventImage(event.image) : undefined,
    zone: place?.zone ?? event?.zone,
    distanceKm: place?.distanceKm ?? event?.distanceKm,
    venue: event?.venue,
    coords: place ? { lat: place.lat, lng: place.lng } : event ? { lat: event.lat, lng: event.lng } : undefined,
  };
}
