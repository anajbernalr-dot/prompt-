import { atDay, hoursAgo, nextWeekday } from '@/lib/format';

import type { AppNotification, ChatMessage, Plan } from './types';

/** Initial plans for a brand-new account, relative to the current date. */
export function seedPlans(now: Date = new Date()): Plan[] {
  const created = now.toISOString();
  return [
    {
      id: 'plan-tostao',
      placeId: 'tostao',
      date: nextWeekday(6, 10, 0, now),
      friendIds: ['anasofi', 'luisv', 'sofir'],
      comment: 'Llego un poquito antes para agarrar mesa afuera ☕️',
      createdAt: created,
    },
    {
      id: 'plan-mamey',
      placeId: 'brunch-mamey',
      date: nextWeekday(0, 12, 0, now),
      friendIds: ['anasofi'],
      createdAt: created,
    },
    {
      id: 'plan-jazz',
      eventId: 'jazz-candelaria',
      date: nextWeekday(6, 20, 0, now),
      friendIds: ['sofir'],
      createdAt: created,
    },
    {
      id: 'plan-arte',
      eventId: 'arte-galpones',
      date: nextWeekday(0, 18, 0, now),
      friendIds: ['valeria'],
      createdAt: created,
    },
  ];
}

export function seedNotifications(now: Date = new Date()): AppNotification[] {
  return [
    {
      id: 'n1',
      kind: 'invite',
      friendId: 'sofir',
      text: 'Sofi R. te invitó a Brunch en Mamey',
      boldParts: ['Sofi R.', 'Brunch en Mamey'],
      target: { kind: 'place', id: 'brunch-mamey' },
      at: hoursAgo(2, now),
      read: false,
    },
    {
      id: 'n2',
      kind: 'comment',
      friendId: 'luisv',
      text: 'Luis V. comentó en Tostao Specialty Coffee',
      boldParts: ['Luis V.', 'Tostao Specialty Coffee'],
      target: { kind: 'friend', id: 'luisv' },
      at: hoursAgo(4, now),
      read: false,
    },
    {
      id: 'n3',
      kind: 'wants',
      friendId: 'valeria',
      text: 'Valeria quiere ir a Noche de Jazz en La Candelaria',
      boldParts: ['Valeria', 'Noche de Jazz en La Candelaria'],
      target: { kind: 'event', id: 'jazz-candelaria' },
      at: hoursAgo(6, now),
      read: false,
    },
    {
      id: 'n4',
      kind: 'follow',
      friendId: 'carlam',
      text: 'Tienes un nuevo seguidor: @carla.m',
      boldParts: ['@carla.m'],
      target: { kind: 'friend', id: 'carlam' },
      at: hoursAgo(8, now),
      read: true,
    },
    {
      id: 'n5',
      kind: 'reminder',
      text: 'Recordatorio: tu plan en Tostao Specialty Coffee',
      boldParts: ['Tostao Specialty Coffee'],
      target: { kind: 'plan', id: 'plan-tostao' },
      at: atDay(1, 10, 0, now),
      read: true,
    },
  ];
}

export function seedChats(now: Date = new Date()): Record<string, ChatMessage[]> {
  const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();
  return {
    luisv: [
      { id: 'm1', from: 'luisv', text: '¿Nos vemos en el café?', at: minutesAgo(52) },
      { id: 'm2', from: 'me', text: 'Sí!! 10 am?', at: minutesAgo(51) },
      { id: 'm3', from: 'luisv', text: 'Perfecto', at: minutesAgo(50) },
    ],
    anasofi: [
      { id: 'm4', from: 'anasofi', text: 'El domingo brunch en Mamey, ¿sí o sí?', at: hoursAgo(20, now) },
      { id: 'm5', from: 'me', text: 'Sí o sí 🙌', at: hoursAgo(19, now) },
    ],
    sofir: [{ id: 'm6', from: 'sofir', text: 'Ya compré mi entrada pal jazz 🎷', at: hoursAgo(3, now) }],
    valeria: [{ id: 'm7', from: 'valeria', text: '¿Te animas a lo de Los Galpones?', at: hoursAgo(30, now) }],
  };
}

/** Friendly auto-replies so chats feel alive in the demo. */
export const autoReplies = [
  '¡Dale! 🙌',
  'Me encanta, cuenta conmigo',
  'Nos vemos ahí 😎',
  'Perfecto, llego puntual (más o menos 😅)',
  '¿Y si invitamos a más panas?',
  'Buenísimo, ya lo anoté',
];

export const defaultSavedPlaces = ['tostao', 'bar-sin-nombre', 'restaurante-1884', 'ciento-once', 'el-techo', 'resto-11'];
export const defaultSavedEvents = ['jazz-candelaria'];
export const defaultPreferences = ['Venezolano', 'Cafetería', 'Brunch', 'Arte', 'Música'];
export const allPreferences = [
  'Venezolano',
  'Cafetería',
  'Brunch',
  'Arte',
  'Música',
  'Cocteles',
  'Rooftops',
  'Mariscos',
  'Cine',
  'Aire libre',
  'Pet friendly',
  'Vida nocturna',
];
