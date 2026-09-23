import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Photo } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import { eventImage } from '@/data/images';
import type { AppEvent } from '@/data/types';
import { formatRelativeDay, formatTime } from '@/lib/format';
import { colors, fonts, radius } from '@/theme';

/** "Eventos esta semana" card: photo with day badge, title and venue below. */
export function WeekEventCard({ event }: { event: AppEvent }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${formatRelativeDay(event.date)} ${formatTime(event.date)}`}
      onPress={() => router.push(`/event/${event.id}`)}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}>
      <Photo source={eventImage(event.image)} rounded={18} style={styles.photo}>
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>
            {formatRelativeDay(event.date)} · {formatTime(event.date)}
          </AppText>
        </View>
        <View style={styles.price}>
          <AppText style={styles.priceText}>{event.price}</AppText>
        </View>
      </Photo>
      <View style={styles.texts}>
        <AppText variant="title" numberOfLines={1} style={{ fontSize: 15 }}>
          {event.title}
        </AppText>
        <AppText variant="small" numberOfLines={1}>
          {event.category} · {event.venue}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 220 },
  photo: { height: 128 },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.ink },
  price: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: colors.blue,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priceText: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.white },
  texts: { paddingTop: 10, paddingHorizontal: 2, gap: 2 },
});
