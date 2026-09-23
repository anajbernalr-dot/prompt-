import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AvatarStack } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { Photo } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import { getEvent } from '@/data/events';
import { getFriend } from '@/data/friends';
import { eventImage, placeImage } from '@/data/images';
import { getPlace } from '@/data/places';
import type { Friend, Plan } from '@/data/types';
import { formatDateTime } from '@/lib/format';
import { planTitle } from '@/store/useAppStore';
import { colors, radius } from '@/theme';

/** Compact upcoming-plan row: thumb · title · date · who's going. */
export function PlanRow({ plan, last }: { plan: Plan; last?: boolean }) {
  const place = getPlace(plan.placeId);
  const event = getEvent(plan.eventId);
  const image = place ? placeImage(place.image) : event ? eventImage(event.image) : undefined;
  const people = plan.friendIds.map((id) => getFriend(id)).filter((f): f is Friend => !!f);
  const title = planTitle(plan);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${formatDateTime(plan.date)}`}
      onPress={() => router.push(`/plans/${plan.id}`)}
      style={({ pressed }) => [styles.row, !last && styles.divider, pressed && { opacity: 0.6 }]}>
      {image ? (
        <Photo source={image} rounded={radius.md} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbEmpty]}>
          <Icon name="calendar" size={20} color={colors.blue} />
        </View>
      )}
      <View style={styles.texts}>
        <AppText variant="title" numberOfLines={1} style={{ fontSize: 15 }}>
          {title}
        </AppText>
        <AppText variant="small" numberOfLines={1}>
          {formatDateTime(plan.date)}
        </AppText>
      </View>
      {people.length ? (
        <AvatarStack people={people} size={26} max={3} />
      ) : (
        <Icon name="chevron-right" size={18} color={colors.textFaint} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, minHeight: 64 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderStrong },
  thumb: { width: 48, height: 48, borderRadius: radius.md },
  thumbEmpty: { backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
});
