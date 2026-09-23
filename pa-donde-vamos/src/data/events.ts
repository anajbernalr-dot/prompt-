import { nextWeekday } from '@/lib/format';

import type { AppEvent } from './types';

// Dates are relative to "now" so the sample content always looks upcoming.
export const events: AppEvent[] = [
  {
    id: 'jazz-candelaria',
    title: 'Noche de Jazz en La Candelaria',
    category: 'Música',
    zone: 'La Candelaria',
    venue: 'Casa Candelaria',
    distanceKm: 2.3,
    date: nextWeekday(6, 20, 0),
    price: '$15',
    description:
      'Una noche de jazz, buena música y tragos en uno de los lugares más icónicos de Caracas.',
    image: 'jazz-candelaria',
    lat: 10.5058,
    lng: -66.9028,
    map: { x: 0.08, y: 0.34 },
  },
  {
    id: 'arte-galpones',
    title: 'Café + Arte en Los Galpones',
    category: 'Arte',
    zone: 'Los Chorros',
    venue: 'Los Galpones',
    distanceKm: 3.1,
    date: nextWeekday(0, 18, 0),
    price: 'Gratis',
    description:
      'Exposición colectiva de artistas caraqueños, café de especialidad y conversatorio al atardecer.',
    image: 'arte-galpones',
    lat: 10.4995,
    lng: -66.8317,
    map: { x: 0.94, y: 0.52 },
  },
  {
    id: 'cine-parque',
    title: 'Cine bajo las estrellas',
    category: 'Cultura',
    zone: 'Parque del Este',
    venue: 'Parque del Este',
    distanceKm: 2.8,
    date: nextWeekday(5, 19, 30),
    price: '$8',
    description:
      'Clásicos del cine venezolano en pantalla gigante, cotufas y mantas sobre la grama del Parque del Este.',
    image: 'cine-parque',
    lat: 10.4943,
    lng: -66.8377,
    map: { x: 0.9, y: 0.72 },
  },
  {
    id: 'mercado-diseno',
    title: 'Mercado de Diseño Local',
    category: 'Gastronomía',
    zone: 'Chacao',
    venue: 'Plaza Altamira',
    distanceKm: 1.0,
    date: nextWeekday(6, 11, 0),
    price: 'Gratis',
    description:
      'Emprendimientos locales, comida callejera, música y mucho talento criollo en un solo lugar.',
    image: 'mercado-diseno',
    lat: 10.4963,
    lng: -66.8503,
    map: { x: 0.58, y: 0.7 },
  },
];

export const getEvent = (id?: string) => events.find((e) => e.id === id);
