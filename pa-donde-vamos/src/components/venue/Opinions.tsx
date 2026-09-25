import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, AvatarStack } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { FilledIcon } from '@/components/Icon';
import { useAllReviews, useAuthorResolver } from '@/components/reviews/data';
import { Stars } from '@/components/reviews/Stars';
import { AppText } from '@/components/Typography';
import { friends } from '@/data/friends';
import type { Place, Review } from '@/data/types';
import { ratingDistribution } from '@/data/venueExtras';
import { tap } from '@/lib/actions';
import { formatTimeAgo } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts } from '@/theme';

import { PillRow, SectionHeader } from './parts';

type Filter = 'todo' | 'panas' | 'comida' | 'ambiente';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'todo', label: 'Todo' },
  { key: 'panas', label: 'Panas' },
  { key: 'comida', label: 'Comida' },
  { key: 'ambiente', label: 'Ambiente' },
];
const FOOD = /(caf[eé]|brunch|toast|pancake|comida|plato|pargo|teque|arepa|cachapa|trago|mojito|c[oó]ctel|flat|guayoyo|postre|panqueca|cerveza|reina)/i;
const VIBE = /(ambiente|m[uú]sica|vibra|terraza|atenci[oó]n|servicio|tranquil|noche|atardecer|lleno|full)/i;

export function OpinionsSection({ place, extra }: { place: Place; extra: Review[] }) {
  const real = useAllReviews({ kind: 'place', id: place.id });
  const resolve = useAuthorResolver();
  const liked = useAppStore((s) => s.likedReviews);
  const [filter, setFilter] = useState<Filter>('todo');
  const [all, setAll] = useState(false);
  const mineCount = real.filter((r) => r.authorId === 'me').length;
  const total = place.reviews + mineCount;
  const dist = ratingDistribution(place.rating);

  const list = useMemo(() => {
    const merged = [...real, ...extra].sort((a, b) => b.at.localeCompare(a.at));
    return merged.filter((r) => {
      if (filter === 'panas') return !!resolve(r.authorId)?.isFriend;
      if (filter === 'comida') return FOOD.test(r.text);
      if (filter === 'ambiente') return VIBE.test(r.text);
      return true;
    });
  }, [real, extra, filter, resolve]);
  const shown = all ? list : list.slice(0, 3);

  return (
    <View style={styles.wrap}>
      <SectionHeader title="Opiniones" />
      <View style={styles.summary}>
        <AppText style={styles.big}>{place.rating.toFixed(1)}</AppText>
        <View style={styles.sumRight}>
          <Stars value={Math.round(place.rating * 2) / 2} size={16} />
          <AppText style={styles.count}>({total} reseñas)</AppText>
        </View>
      </View>
      <View style={styles.bars}>
        {dist.map((pct, i) => (
          <View key={i} style={styles.barRow}>
            <AppText style={styles.barLabel}>{5 - i} ★</AppText>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${pct}%` }]} />
            </View>
            <AppText style={styles.pct}>{pct}%</AppText>
          </View>
        ))}
      </View>

      <PillRow options={FILTERS} value={filter} onChange={setFilter} style={styles.chips} />

      {shown.length === 0 ? (
        <AppText style={styles.empty}>Todavía no hay opiniones aquí.</AppText>
      ) : (
        shown.map((r, i) => {
          const a = resolve(r.authorId);
          if (!a) return null;
          const isLiked = liked.includes(r.id);
          const likers = friends.filter((f) => f.id !== r.authorId).slice(i % 4, (i % 4) + 3);
          return (
            <View key={r.id} style={[styles.review, i > 0 && styles.sep]}>
              <Avatar name={a.name} image={a.avatar} size={40} />
              <View style={styles.flex}>
                <View style={styles.nameRow}>
                  <AppText style={styles.name} numberOfLines={1}>
                    {a.isMe ? 'Tú' : a.name}
                  </AppText>
                  <AppText style={styles.score}>{(r.rating * 2).toFixed(r.rating * 2 === 10 ? 0 : 1)}/10</AppText>
                </View>
                <AppText style={styles.when}>
                  {formatTimeAgo(r.at)} · {place.zone}
                </AppText>
                <Stars value={r.rating} size={12} />
                <AppText style={styles.text}>{r.text}</AppText>
                <View style={styles.likeRow}>
                  <AvatarStack people={likers} size={22} max={3} extra={r.likes > 3 ? r.likes - 3 : 0} />
                  <Pressable
                    onPress={() => {
                      tap();
                      useAppStore.getState().toggleLikeReview(r.id);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isLiked }}
                    accessibilityLabel={isLiked ? 'Quitar me gusta' : 'Me gusta'}
                    hitSlop={8}
                    style={styles.like}>
                    <FilledIcon name={isLiked ? 'heart' : 'heart-outline'} size={17} color={isLiked ? '#FF6B6B' : colors.inkSoft} />
                    <AppText style={styles.likeText}>{r.likes + (isLiked ? 1 : 0)}</AppText>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })
      )}
      <View style={styles.ctaRow}>
        {list.length > 3 ? (
          <Button label={all ? 'Ver menos' : `Ver todas (${list.length})`} variant="outline" size="md" onPress={() => setAll((v) => !v)} style={styles.flex} />
        ) : null}
        <Button label="Reseñar" iconLeft="edit-3" size="md" onPress={() => router.push(`/review/new?kind=place&id=${place.id}`)} style={styles.flex} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { marginTop: 40 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 },
  big: { fontFamily: fonts.serifBlack, fontSize: 52, lineHeight: 58, color: colors.ink, letterSpacing: -1 },
  sumRight: { gap: 4 },
  count: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.textMuted },
  bars: { gap: 8, marginTop: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { width: 28, fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.inkSoft },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3, backgroundColor: colors.ink },
  pct: { width: 34, textAlign: 'right', fontFamily: fonts.sans, fontSize: 12, color: colors.textMuted },
  chips: { marginTop: 20, marginBottom: 6 },
  empty: { fontFamily: fonts.sans, fontSize: 14, color: colors.textMuted, paddingVertical: 16 },
  review: { flexDirection: 'row', gap: 12, paddingVertical: 16 },
  sep: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { flexShrink: 1, fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.ink },
  score: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.blue },
  when: { fontFamily: fonts.sans, fontSize: 12, color: colors.textMuted, marginTop: 1, marginBottom: 4 },
  text: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.inkSoft, marginTop: 6 },
  likeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  like: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 32, paddingHorizontal: 4 },
  likeText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.inkSoft },
  ctaRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
