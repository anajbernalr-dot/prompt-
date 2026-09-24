import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { FilledIcon, Icon } from '@/components/Icon';
import { Photo } from '@/components/Surfaces';
import { showToast } from '@/components/Toast';
import { AppText } from '@/components/Typography';
import { reactionMeta } from '@/data/reviews';
import type { Reaction, Review } from '@/data/types';
import { shareText, tap } from '@/lib/actions';
import { formatTimeAgo } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius } from '@/theme';

import { targetInfo, type ReviewAuthor } from './data';
import { Stars } from './Stars';

const HEART = '#FF5A5F';

export function ReactionChip({ reaction, small }: { reaction: Reaction; small?: boolean }) {
  const meta = reactionMeta[reaction];
  const tone = reaction === 'love' ? styles.love : reaction === 'meh' ? styles.meh : styles.nope;
  return (
    <View style={[styles.chip, tone, small && styles.chipSm]}>
      <AppText style={[styles.chipEmoji, small && { fontSize: 12 }]}>{meta.emoji}</AppText>
      <AppText style={[styles.chipText, small && { fontSize: 12 }]}>{meta.label}</AppText>
    </View>
  );
}

export function ReviewCard({
  review,
  author,
  compact = false,
}: {
  review: Review;
  author: ReviewAuthor;
  compact?: boolean;
}) {
  const liked = useAppStore((s) => s.likedReviews.includes(review.id));
  const target = targetInfo(review.target);
  const likes = review.likes + (liked ? 1 : 0);
  const open = () => target && router.push(target.href);

  const like = () => {
    tap();
    useAppStore.getState().toggleLikeReview(review.id);
  };

  const share = async () => {
    const shared = await shareText(
      `${author.isMe ? 'Mi reseña' : `${author.name} dice`} de ${target?.name ?? 'este sitio'}: ${reactionMeta[review.reaction].emoji} ${review.rating}★ — "${review.text}"`,
    );
    if (shared && Platform.OS === 'web') showToast('Enlace copiado', 'link');
  };

  const remove = () => {
    useAppStore.getState().deleteReview(review.id);
    showToast('Reseña borrada', 'trash-2');
  };

  const wantToGo = () => {
    if (!target) return;
    tap();
    if (target.kind === 'place') {
      const s = useAppStore.getState();
      if (!s.savedPlaces.includes(target.id)) s.toggleSavePlace(target.id);
    } else {
      const s = useAppStore.getState();
      if (!s.savedEvents.includes(target.id)) s.toggleSaveEvent(target.id);
    }
    showToast('Guardado para ir 🙌', 'bookmark');
  };

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.authorRow}>
        <Avatar name={author.name} image={author.avatar} size={compact ? 36 : 42} />
        <View style={styles.flex}>
          <View style={styles.nameRow}>
            <AppText style={styles.name} numberOfLines={1}>
              {author.isMe ? `${author.name} (tú)` : author.name}
            </AppText>
            {author.isFriend ? (
              <View style={styles.panaTag}>
                <AppText style={styles.panaText}>tu pana</AppText>
              </View>
            ) : null}
          </View>
          <AppText style={styles.handle} numberOfLines={1}>
            @{author.handle} · {formatTimeAgo(review.at)}
          </AppText>
        </View>
        {author.isMe ? (
          <Pressable onPress={remove} hitSlop={10} accessibilityRole="button" accessibilityLabel="Borrar reseña" style={styles.iconBtn}>
            <Icon name="trash-2" size={17} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {!compact && target ? (
        <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`Ver ${target.name}`}>
          {({ pressed }) => (
            <Photo source={target.image} rounded={22} style={[styles.photo, pressed && { opacity: 0.9 }]} />
          )}
        </Pressable>
      ) : null}

      <View style={styles.verdict}>
        <ReactionChip reaction={review.reaction} small={compact} />
        <Stars value={review.rating} size={compact ? 14 : 16} />
        <AppText style={styles.ratingNum}>{review.rating.toFixed(1)}</AppText>
      </View>

      {review.text ? <AppText style={styles.text}>{review.text}</AppText> : null}

      {!compact && target ? (
        <Pressable onPress={open} hitSlop={6} accessibilityRole="link" style={styles.placeLine}>
          <AppText style={styles.place} numberOfLines={1}>
            📍 <AppText style={styles.placeName}>{target.name}</AppText> · {target.zone}
          </AppText>
        </Pressable>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={like}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: liked }}
          accessibilityLabel={liked ? 'Quitar me gusta' : 'Me gusta'}
          style={styles.action}>
          <FilledIcon name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? HEART : colors.ink} />
          <AppText style={styles.actionText}>{likes}</AppText>
        </Pressable>
        {!compact && !author.isMe ? (
          <Pressable onPress={wantToGo} hitSlop={8} accessibilityRole="button" style={styles.action}>
            <Icon name="bookmark" size={19} color={colors.ink} />
            <AppText style={styles.actionText}>Yo también quiero ir</AppText>
          </Pressable>
        ) : null}
        <View style={styles.flex} />
        <Pressable onPress={share} hitSlop={8} accessibilityRole="button" accessibilityLabel="Compartir reseña" style={styles.action}>
          <Icon name="send" size={19} color={colors.ink} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { paddingVertical: 18 },
  cardCompact: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  name: { fontFamily: fonts.sansSemi, fontSize: 15.5, color: colors.ink, flexShrink: 1 },
  handle: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted, marginTop: 1 },
  panaTag: { backgroundColor: colors.blueSoft, borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 1.5 },
  panaText: { fontFamily: fonts.sansSemi, fontSize: 10.5, color: colors.blueInk },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  photo: { height: 250, marginTop: 14 },
  verdict: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  ratingNum: { fontFamily: fonts.sansSemi, fontSize: 13.5, color: colors.inkSoft, marginLeft: -4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 30,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipSm: { height: 26, paddingHorizontal: 9 },
  love: { backgroundColor: colors.blueSoft, borderColor: colors.blueSoft },
  meh: { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
  nope: { backgroundColor: 'transparent', borderColor: colors.borderStrong },
  chipEmoji: { fontSize: 14 },
  chipText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  text: { fontFamily: fonts.sans, fontSize: 15.5, lineHeight: 22.5, color: colors.inkSoft, marginTop: 10 },
  placeLine: { marginTop: 10, alignSelf: 'flex-start' },
  place: { fontFamily: fonts.sans, fontSize: 14, color: colors.textMuted },
  placeName: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.blue },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 12 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36 },
  actionText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
});
