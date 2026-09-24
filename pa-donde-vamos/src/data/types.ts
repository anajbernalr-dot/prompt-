export type PlaceCategory = 'cafe' | 'restaurante' | 'bar';

export type Place = {
  id: string;
  name: string;
  category: PlaceCategory;
  /** Label shown in the UI, e.g. "Cafetería", "Bar", "Restaurante". */
  categoryLabel: string;
  zone: string;
  address: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  /** Second rating source shown on the detail screen (e.g. Google). */
  ratingAlt: number;
  reviewsAlt: number;
  price: string;
  opens: string;
  closes: string;
  description: string;
  tags: string[];
  /** Key into `images.places`. */
  image: string;
  lat: number;
  lng: number;
  /** Position on the stylized map, 0..1 on each axis. */
  map: { x: number; y: number };
  featured?: boolean;
};

export type EventCategory = 'Música' | 'Arte' | 'Cultura' | 'Gastronomía';

export type AppEvent = {
  id: string;
  title: string;
  category: EventCategory;
  zone: string;
  venue: string;
  distanceKm: number;
  /** ISO date-time. */
  date: string;
  price: string;
  /** Official page where tickets are sold. Paid events open this instead of buying in-app. */
  ticketUrl?: string;
  description: string;
  /** Key into `images.events`. */
  image: string;
  lat: number;
  lng: number;
  map: { x: number; y: number };
};

export type Friend = {
  id: string;
  name: string;
  handle: string;
  /** Key into `images.avatars`. */
  avatar: string;
  online: boolean;
};

export type Plan = {
  id: string;
  /** Either a place or an event. */
  placeId?: string;
  eventId?: string;
  /** Custom title for "Otro" plans. */
  title?: string;
  /** ISO date-time. */
  date: string;
  friendIds: string[];
  comment?: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  /** 'me' or a friend id. */
  from: string;
  text: string;
  /** ISO date-time. */
  at: string;
};

export type NotificationKind = 'invite' | 'comment' | 'wants' | 'follow' | 'reminder' | 'plan' | 'tickets';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  friendId?: string;
  /** Plain text. `boldParts` are rendered in bold inside it. */
  text: string;
  boldParts?: string[];
  target?: { kind: 'place' | 'event' | 'plan' | 'friend'; id: string };
  /** ISO date-time. */
  at: string;
  read: boolean;
};

export type User = {
  name: string;
  email: string;
  handle: string;
  /** Key into `images.avatars` or null for initials. */
  avatar: string | null;
};

export type PlanCategory = 'restaurante' | 'cafe' | 'bar' | 'evento' | 'otro';

export type PlanDraft = {
  category?: PlanCategory;
  placeId?: string;
  eventId?: string;
  title?: string;
  date?: string;
  friendIds: string[];
  comment?: string;
};

/** Letterboxd-style verdict. */
export type Reaction = 'love' | 'meh' | 'nope';

/** A review / feed post about a place or event. */
export type Review = {
  id: string;
  /** 'me' or a friend id or a community author id (see data/reviews `authors`). */
  authorId: string;
  target: { kind: 'place' | 'event'; id: string };
  /** 1–5, halves allowed (e.g. 4.5). */
  rating: number;
  reaction: Reaction;
  text: string;
  /** Key into place/event images, or undefined to use the target's cover. */
  photo?: string;
  /** ISO date-time. */
  at: string;
  likes: number;
};
