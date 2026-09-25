import { hoursAgo } from '@/lib/format';

import type { Answer, Question } from './types';

const q = (id: string, authorId: string, title: string, location: string, body: string, hours: number, likes: number): Question => ({
  id,
  authorId,
  title,
  location,
  body,
  at: hoursAgo(hours),
  likes,
});

const a = (
  id: string,
  questionId: string,
  authorId: string,
  text: string,
  hours: number,
  likes: number,
  placeId?: string,
): Answer => ({ id, questionId, authorId, text, placeId, at: hoursAgo(hours), likes });

/** Sample questions from the user's panas (relative to "now" so the feed always looks fresh). */
export const seedQuestions: Question[] = [
  q('q-cafe', 'sofir', 'Café + lectura + buena vibra?', 'Caracas', 'Busco un sitio tranquilo para leer un rato el sábado en la mañana. Que tenga buen café y no esté full.', 2, 6),
  q('q-guaira', 'valeria', 'Plan de un día en La Guaira?', 'La Guaira', '¿Algún plan bueno para un día? Sugerencias de comida, playas o algo chévere para hacer.', 9, 5),
  q('q-musica', 'luisv', '¿Algún buen evento de música esta semana?', 'Caracas', 'Tengo ganas de salir a ver algo en vivo, jazz o lo que sea. ¿Qué hay?', 16, 3),
  q('q-techo', 'anasofi', '¿Hay que reservar en El Techo?', 'Las Mercedes', 'Vamos el viernes como 6 pm para el atardecer. ¿Se llena mucho?', 28, 2),
];

export const seedAnswers: Answer[] = [
  a('a1', 'q-cafe', 'mariaf', 'Café Ávila, sin duda. Silencioso, buena luz y el guayoyo es otro nivel.', 1.5, 3, 'cafe-avila'),
  a('a2', 'q-cafe', 'anasofi', 'También te recomiendo Tostao. Llega temprano y agarra mesa en la terraza ☕', 1, 2, 'tostao'),
  a('a3', 'q-guaira', 'carlam', 'Desayuno en Macuto, playa en la mañana y de regreso almuerzo en El Barco. Plan redondo 🐟', 8, 4, 'el-barco'),
  a('a4', 'q-guaira', 'gabo', 'Sal tempranito que la autopista se pone fea después de las 10.', 7, 1),
  a('a5', 'q-guaira', 'diegop', 'El malecón de Macuto al atardecer es una nota.', 6, 0),
  a('a6', 'q-musica', 'sofir', '¡El jazz en La Candelaria! Fui la vez pasada y se la comieron 🎷', 14, 2),
  a('a7', 'q-techo', 'sofir', 'Sí, yo reservaría. Siempre se llena los fines de semana.', 27, 1),
];

/** Replies friends "send" to the user's own questions and answers, each recommending a real place. */
export const questionAutoReplies: { friendId: string; text: string; placeId: string }[] = [
  { friendId: 'sofir', text: 'Yo iría a Tostao. El ambiente es buenísimo y tienen unos croissants increíbles.', placeId: 'tostao' },
  { friendId: 'luisv', text: 'También te recomiendo El Techo. Pide el mojito de parchita y ve al atardecer.', placeId: 'el-techo' },
  { friendId: 'anasofi', text: 'Mamey tiene una terraza bellísima, pero ve temprano que se llena.', placeId: 'brunch-mamey' },
  { friendId: 'carlam', text: 'La Guacamaya nunca falla, sobre todo tarde en la noche 🫓', placeId: 'la-guacamaya' },
  { friendId: 'valeria', text: 'Ciento Once se prende los viernes y los tequeños son lo máximo.', placeId: 'ciento-once' },
];

export const getSeedQuestion = (id?: string) => seedQuestions.find((x) => x.id === id);
