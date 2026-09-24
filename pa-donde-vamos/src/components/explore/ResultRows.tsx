import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/Button';
import { FilledIcon, Icon } from '@/components/Icon';
import { Photo } from '@/components/Surfaces';
import { showToast } from '@/components/Toast';
import { AppText } from '@/components/Typography';
import { eventImage, placeImage } from '@/data/images';
import type { AppEvent, Place } from '@/data/types';
import { tap } from '@/lib/actions';
import { formatDateTime, formatKm } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts } from '@/theme';

function ResultRow({
  image,
  title,
  meta,
  action,
  onPress,
  last,
}: {
  image: Parameters<typeof Photo>[0]['source'];
  title: string;
  meta: string;
  action: ReactNode;
  onPress: () => void;
  last?: boolean;
}) {
  // The save button sits beside (not inside) the row pressable: nested buttons are invalid on web.
  return (
    <View style={[styles.wrap, !last && styles.divider]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${meta}`}
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
        <Photo source={image} rounded={14} style={styles.thumb} />
        <View style={styles.body}>
          <AppText variant="title" numberOfLines={2} style={styles.title}>
            {title}
          </AppText>
          <AppText variant="small" style={styles.meta}>
            {meta}
          </AppText>
        </View>
      </Pressable>
      <View style={styles.action}>{action}</View>
    </View>
  );
}

export function PlaceResultRow({ place, last }: { place: Place; last?: boolean }) {
  const saved = useAppStore((s) => s.savedPlaces.includes(place.id));
  const toggleSavePlace = useAppStore((s) => s.toggleSavePlace);

  const onToggle = () => {
    tap();
    toggleSavePlace(place.id);
    showToast(saved ? 'Quitado de tus guardados' : 'Guardado en tus lugares', saved ? 'x' : 'heart');
  };

  return (
    <ResultRow
      image={placeImage(place.image)}
      title={place.name}
      meta={`${place.categoryLabel} · ${place.zone} · ${formatKm(place.distanceKm)}`}
      onPress={() => router.push(`/place/${place.id}`)}
      last={last}
      action={
        <IconButton
          accessibilityLabel={saved ? `Quitar ${place.name} de guardados` : `Guardar ${place.name}`}
          onPress={onToggle}
          size={44}>
          {saved ? (
            <FilledIcon name="heart" size={24} color={colors.blue} />
          ) : (
            <Icon name="heart" size={22} color={colors.ink} />
          )}
        </IconButton>
      }
    />
  );
}

export function EventResultRow({ event, last }: { event: AppEvent; last?: boolean }) {
  const saved = useAppStore((s) => s.savedEvents.includes(event.id));
  const toggleSaveEvent = useAppStore((s) => s.toggleSaveEvent);

  const onToggle = () => {
    tap();
    toggleSaveEvent(event.id);
    showToast(saved ? 'Quitado de tus guardados' : 'Evento guardado', saved ? 'x' : 'bookmark');
  };

  return (
    <ResultRow
      image={eventImage(event.image)}
      title={event.title}
      meta={`${formatDateTime(event.date)} · ${event.zone}`}
      onPress={() => router.push(`/event/${event.id}`)}
      last={last}
      action={
        <IconButton
          accessibilityLabel={saved ? `Quitar ${event.title} de guardados` : `Guardar ${event.title}`}
          onPress={onToggle}
          size={44}>
          {saved ? (
            <FilledIcon name="bookmark" size={22} color={colors.blue} />
          ) : (
            <Icon name="bookmark" size={21} color={colors.ink} />
          )}
        </IconButton>
      }
    />
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderStrong },
  thumb: { width: 84, height: 84 },
  body: { flex: 1, gap: 6 },
  title: { fontSize: 16.5, lineHeight: 22, fontFamily: fonts.sansSemi, paddingRight: 40 },
  meta: { fontSize: 13.5, lineHeight: 19 },
  action: { position: 'absolute', top: 18, right: -10 },
});
