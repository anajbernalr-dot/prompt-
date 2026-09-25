import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { FilledIcon, Icon } from '@/components/Icon';
import type { ReviewAuthor } from '@/components/reviews/data';
import { Photo } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import { placeImage } from '@/data/images';
import { getPlace } from '@/data/places';
import type { Answer } from '@/data/types';
import { tap } from '@/lib/actions';
import { formatTimeAgo } from '@/lib/format';
import { colors, fonts, radius } from '@/theme';

const HEART = '#FF5A5F';

export function PlaceMini({ placeId, onRemove }: { placeId: string; onRemove?: () => void }) {
  const place = getPlace(placeId);
  if (!place) return null;
  return (
    <Pressable
      onPress={() => router.push(`/place/${place.id}`)}
      accessibilityRole="link"
      accessibilityLabel={`Ver ${place.name}`}
      style={({ pressed }) => [styles.place, pressed && { opacity: 0.85 }]}>
      <Photo source={placeImage(place.image)} rounded={10} style={styles.thumb} />
      <View style={styles.flex}>
        <AppText style={styles.placeName} numberOfLines={1}>
          {place.name}
        </AppText>
        <AppText style={styles.placeMeta} numberOfLines={1}>
          {place.categoryLabel} · {place.zone}
        </AppText>
        <View style={styles.ratingRow}>
          <FilledIcon name="star" size={12} color={colors.star} />
          <AppText style={styles.rating}>
            {place.rating.toFixed(1)} ({place.reviews})
          </AppText>
        </View>
      </View>
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={10} accessibilityRole="button" accessibilityLabel="Quitar lugar" style={styles.chev}>
          <Icon name="x" size={18} color={colors.textMuted} />
        </Pressable>
      ) : (
        <Icon name="chevron-right" size={18} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

export function AnswerRow({ answer, author, onReply }: { answer: Answer; author: ReviewAuthor; onReply: (name: string) => void }) {
  const [liked, setLiked] = useState(false);
  const likes = answer.likes + (liked ? 1 : 0);
  return (
    <View style={styles.row}>
      <Avatar name={author.name} image={author.avatar} size={38} />
      <View style={styles.flex}>
        <AppText style={styles.head} numberOfLines={1}>
          <AppText style={styles.name}>{author.isMe ? `${author.name} (tú)` : author.name}</AppText>
          {'  '}@{author.handle} · {formatTimeAgo(answer.at)}
        </AppText>
        {answer.text ? <AppText style={styles.text}>{answer.text}</AppText> : null}
        {answer.placeId ? <PlaceMini placeId={answer.placeId} /> : null}
        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              tap();
              setLiked((l) => !l);
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={liked ? 'Quitar me gusta' : 'Me gusta'}
            style={styles.action}>
            <FilledIcon name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? HEART : colors.ink} />
            <AppText style={styles.actionText}>{likes}</AppText>
          </Pressable>
          <Pressable onPress={() => onReply(author.name)} hitSlop={8} accessibilityRole="button" style={styles.action}>
            <Icon name="corner-up-left" size={15} color={colors.textMuted} />
            <AppText style={styles.reply}>Responder</AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 14, borderTopWidth: 1, borderColor: colors.border },
  head: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textMuted },
  name: { fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.ink },
  text: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 21, color: colors.inkSoft, marginTop: 4 },
  place: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    padding: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  thumb: { width: 64, height: 64 },
  placeName: { fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.ink },
  placeMeta: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.inkSoft },
  chev: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 6 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 34 },
  actionText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink },
  reply: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.textMuted },
});
