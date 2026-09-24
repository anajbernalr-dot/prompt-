import { useMemo } from 'react';
import type { ImageSourcePropType } from 'react-native';

import { getEvent } from '@/data/events';
import { eventImage, placeImage } from '@/data/images';
import { getPlace } from '@/data/places';
import { getAuthor, seedReviews } from '@/data/reviews';
import type { Reaction, Review } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';

export type ReviewTarget = Review['target'];

export type TargetInfo = {
  kind: 'place' | 'event';
  id: string;
  name: string;
  zone: string;
  meta: string;
  image: ImageSourcePropType | undefined;
  href: string;
  /** Place category ('cafe' | 'restaurante' | 'bar') or 'evento'. */
  category: string;
};

export function targetInfo(t: ReviewTarget): TargetInfo | undefined {
  if (t.kind === 'place') {
    const p = getPlace(t.id);
    if (!p) return undefined;
    return {
      kind: 'place',
      id: p.id,
      name: p.name,
      zone: p.zone,
      meta: `${p.categoryLabel} · ${p.zone}`,
      image: placeImage(p.image),
      href: `/place/${p.id}`,
      category: p.category,
    };
  }
  const e = getEvent(t.id);
  if (!e) return undefined;
  return {
    kind: 'event',
    id: e.id,
    name: e.title,
    zone: e.zone,
    meta: `${e.category} · ${e.zone}`,
    image: eventImage(e.image),
    href: `/event/${e.id}`,
    category: 'evento',
  };
}

export type ReviewAuthor = { id: string; name: string; handle: string; avatar: string | null; isFriend: boolean; isMe: boolean };

export function useAuthorResolver() {
  const user = useAppStore((s) => s.user);
  const friendIds = useAppStore((s) => s.friendIds);
  return useMemo(
    () =>
      (id: string): ReviewAuthor | undefined => {
        if (id === 'me') {
          return {
            id: 'me',
            name: user?.name || 'Tú',
            handle: user?.handle || 'tu',
            avatar: user?.avatar ?? null,
            isFriend: false,
            isMe: true,
          };
        }
        const a = getAuthor(id);
        if (!a) return undefined;
        return { ...a, isFriend: a.isFriend && friendIds.includes(a.id), isMe: false };
      },
    [user, friendIds],
  );
}

/** Seed + the user's own reviews, newest first. Optionally only for one target. */
export function useAllReviews(target?: ReviewTarget): Review[] {
  const mine = useAppStore((s) => s.myReviews);
  const kind = target?.kind;
  const id = target?.id;
  return useMemo(() => {
    const all = [...mine, ...seedReviews].filter((r) => !kind || (r.target.kind === kind && r.target.id === id));
    return all.sort((a, b) => b.at.localeCompare(a.at));
  }, [mine, kind, id]);
}

export function summarize(reviews: Review[]) {
  const counts: Record<Reaction, number> = { love: 0, meh: 0, nope: 0 };
  let sum = 0;
  for (const r of reviews) {
    counts[r.reaction] += 1;
    sum += r.rating;
  }
  return { count: reviews.length, average: reviews.length ? sum / reviews.length : 0, counts };
}
