import { hoursAgo } from '@/lib/format';

import { friends } from './friends';
import type { Reaction, Review } from './types';

/** People from the community (not your panas) who also post reviews. They use initials avatars. */
export const authors: { id: string; name: string; handle: string; avatar: string | null }[] = [
  { id: 'cami', name: 'Cami Rojas', handle: 'camirojas', avatar: null },
  { id: 'andres', name: 'Andrés Pérez', handle: 'andresccs', avatar: null },
  { id: 'lu', name: 'Lucía M.', handle: 'lu.come', avatar: null },
  { id: 'rafa', name: 'Rafa Díaz', handle: 'rafadiaz', avatar: null },
];

/** Resolves any author id (friend or community) to display info. */
export function getAuthor(id: string) {
  const f = friends.find((x) => x.id === id);
  if (f) return { id: f.id, name: f.name, handle: f.handle, avatar: f.avatar as string | null, isFriend: true };
  const a = authors.find((x) => x.id === id);
  return a ? { ...a, isFriend: false } : undefined;
}

export const reactionMeta: Record<Reaction, { label: string; emoji: string }> = {
  love: { label: 'Me encantó', emoji: '😍' },
  meh: { label: 'Meh', emoji: '😐' },
  nope: { label: 'No me gustó', emoji: '👎' },
};

const r = (
  id: string,
  authorId: string,
  kind: 'place' | 'event',
  targetId: string,
  rating: number,
  reaction: Reaction,
  text: string,
  hours: number,
  likes: number,
): Review => ({ id, authorId, target: { kind, id: targetId }, rating, reaction, text, at: hoursAgo(hours), likes });

// Sample community reviews (relative to "now" so the feed always looks fresh).
export const seedReviews: Review[] = [
  r('r1', 'anasofi', 'place', 'tostao', 5, 'love', 'El flat white más rico de Caracas y la terraza es una nota ☕🌿 Llegar temprano el sábado.', 1.5, 34),
  r('r2', 'luisv', 'place', 'el-techo', 4.5, 'love', 'El atardecer con el Ávila de fondo no tiene precio. Pidan el mojito de parchita.', 3, 51),
  r('r3', 'cami', 'place', 'la-bodeguita', 3, 'meh', 'Buenos tragos pero estaba full y la música muy alta. Mejor un jueves.', 5, 12),
  r('r4', 'sofir', 'event', 'jazz-candelaria', 5, 'love', '¡Qué noche! El trío de jazz se la comió 🎷 Repetimos seguro.', 7, 88),
  r('r5', 'andres', 'place', 'el-barco', 4, 'love', 'Pargo frito perfecto y el servicio súper atento. Un poco caro pero vale la pena.', 10, 19),
  r('r6', 'valeria', 'event', 'arte-galpones', 4, 'love', 'Mucho talento criollo. Me traje dos láminas para la casa 🎨', 14, 27),
  r('r7', 'lu', 'place', 'brunch-mamey', 2.5, 'nope', 'Las panquecas llegaron frías y esperamos 40 min. La terraza bonita, eso sí.', 20, 8),
  r('r8', 'carlam', 'place', 'la-guacamaya', 4.5, 'love', 'La reina pepiada a las 2 am después de la rumba = felicidad pura 🫓', 26, 42),
  r('r9', 'rafa', 'place', 'restaurante-1884', 5, 'love', 'Celebramos un cumple y todo impecable. El postre de guayaba 🤌', 30, 23),
  r('r10', 'gabo', 'place', 'bar-sin-nombre', 3.5, 'meh', 'Los vinilos buenísimos, la cerveza artesanal más o menos.', 40, 9),
  r('r11', 'mariaf', 'place', 'cafe-avila', 4.5, 'love', 'Mi sitio favorito para trabajar. Silencioso y con el mejor guayoyo.', 52, 15),
  r('r12', 'diegop', 'place', 'ciento-once', 4, 'love', 'Los tequeños con miel de papelón 🔥 La terraza se prende los viernes.', 60, 21),
];
