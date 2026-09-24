import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Asterisk } from '@/components/illustrations';
import { AppText, Handwritten, Title } from '@/components/Typography';
import { reactionMeta } from '@/data/reviews';
import type { Reaction } from '@/data/types';
import { colors, fonts, radius } from '@/theme';

import { summarize, useAllReviews, useAuthorResolver, type ReviewTarget } from './data';
import { ReviewCard } from './ReviewCard';
import { Stars } from './Stars';

const ORDER: Reaction[] = ['love', 'meh', 'nope'];

/** "Lo que dice la gente": summary, CTA and list of reviews for a place or event. */
export function ReviewsSection({ target }: { target: ReviewTarget }) {
  const reviews = useAllReviews(target);
  const resolve = useAuthorResolver();
  const { count, average, counts } = summarize(reviews);
  const write = () => router.push(`/review/new?kind=${target.kind}&id=${target.id}`);

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <Title level={2} style={styles.title}>
          Lo que dice la gente
        </Title>
        <Asterisk width={22} style={styles.asterisk} />
      </View>

      <View style={styles.summary}>
        <View style={styles.avgBox}>
          <AppText style={styles.avg}>{count ? average.toFixed(1) : '–'}</AppText>
          <Stars value={Math.round(average * 2) / 2} size={14} />
          <AppText style={styles.count}>
            {count} {count === 1 ? 'reseña' : 'reseñas'}
          </AppText>
        </View>
        <View style={styles.bars}>
          {ORDER.map((k) => {
            const pct = count ? counts[k] / count : 0;
            return (
              <View key={k} style={styles.barRow}>
                <AppText style={styles.barEmoji}>{reactionMeta[k].emoji}</AppText>
                <AppText style={styles.barLabel} numberOfLines={1}>
                  {reactionMeta[k].label}
                </AppText>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${pct * 100}%` }, k !== 'love' && styles.fillMuted]} />
                </View>
                <AppText style={styles.barNum}>{counts[k]}</AppText>
              </View>
            );
          })}
        </View>
      </View>

      <Button label="Reseñar" iconLeft="edit-3" onPress={write} style={styles.cta} />

      {count === 0 ? (
        <View style={styles.empty}>
          <Handwritten rotate={-3} size={22}>
            ¡Sé el primero en reseñar!
          </Handwritten>
        </View>
      ) : (
        <View style={styles.list}>
          {reviews.map((r) => {
            const a = resolve(r.authorId);
            return a ? <ReviewCard key={r.id} review={r} author={a} compact /> : null;
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 34 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 24, lineHeight: 29 },
  asterisk: { marginTop: -10 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 16,
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avgBox: { alignItems: 'center', gap: 4, minWidth: 86 },
  avg: { fontFamily: fonts.serifBlack, fontSize: 44, lineHeight: 48, color: colors.ink, letterSpacing: -1 },
  count: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textMuted },
  bars: { flex: 1, gap: 9 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barEmoji: { fontSize: 13, width: 18 },
  barLabel: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.inkSoft, width: 76 },
  track: { flex: 1, height: 7, borderRadius: 4, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: colors.blue },
  fillMuted: { backgroundColor: colors.ink },
  barNum: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.ink, width: 16, textAlign: 'right' },
  cta: { marginTop: 14 },
  empty: { alignItems: 'center', paddingVertical: 22 },
  list: { gap: 12, marginTop: 16 },
});
