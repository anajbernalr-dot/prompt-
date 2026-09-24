import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { Button, IconButton } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { DetailNotFound } from '@/components/detail/DetailNotFound';
import { FriendsGoing } from '@/components/detail/FriendsGoing';
import { isOpenAt, useNow } from '@/components/detail/hours';
import { InfoRow } from '@/components/detail/InfoRow';
import { BackButton } from '@/components/Header';
import { FilledIcon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { Photo } from '@/components/Surfaces';
import { showToast } from '@/components/Toast';
import { AppText } from '@/components/Typography';
import { placeImage } from '@/data/images';
import { getPlace } from '@/data/places';
import type { Place } from '@/data/types';
import { openDirections, shareText, success, tap } from '@/lib/actions';
import { formatKm } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts } from '@/theme';

const HEART = '#FF6B6B';
const GLASS = 'rgba(12, 14, 20, 0.38)';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const place = getPlace(id);
  if (!place) {
    return (
      <DetailNotFound
        title="No encontramos este lugar"
        body="Puede que ya no esté en la app o que el enlace esté malo. Échale un ojo a otros sitios."
      />
    );
  }
  return <PlaceDetail place={place} />;
}

function PlaceDetail({ place }: { place: Place }) {
  const saved = useAppStore((s) => s.savedPlaces.includes(place.id));
  const now = useNow();
  const open = isOpenAt(place.opens, place.closes, now);

  const toggleSave = () => {
    tap();
    useAppStore.getState().toggleSavePlace(place.id);
    if (saved) showToast('Quitado de tus lugares', 'x');
    else {
      success();
      showToast('Guardado en tus lugares', 'bookmark');
    }
  };

  const share = async () => {
    const shared = await shareText(`${place.name} en ${place.zone} — vamos? 🙌`);
    if (shared && Platform.OS === 'web') showToast('Enlace copiado', 'link');
  };

  const makePlan = () => {
    useAppStore.getState().resetDraft({ category: place.category, placeId: place.id });
    router.push('/plan/place');
  };

  return (
    <Screen
      footer={
        <>
          <View style={styles.actions}>
            <Button
              label={saved ? 'Guardado' : 'Guardar'}
              leading={<FilledIcon name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={colors.white} />}
              onPress={toggleSave}
              accessibilityLabel={saved ? 'Quitar de guardados' : 'Guardar lugar'}
              style={styles.half}
            />
            <Button
              label="Ir ahora"
              variant="accent"
              iconRight="arrow-right"
              onPress={() => openDirections(place.lat, place.lng, place.name)}
              accessibilityLabel={`Cómo llegar a ${place.name}`}
              style={styles.half}
            />
          </View>
          <Button label="Armar un plan aquí" variant="ghost" size="sm" iconLeft="calendar" onPress={makePlan} />
        </>
      }>
      <Photo source={placeImage(place.image)} rounded={24} style={styles.hero}>
        <LinearGradient colors={['rgba(0,0,0,0.38)', 'rgba(0,0,0,0)']} style={styles.heroShade} />
        <View style={styles.heroBar}>
          <BackButton color={colors.white} background={GLASS} fallback="/" />
          <View style={styles.heroRight}>
            <IconButton
              onPress={toggleSave}
              size={42}
              background={GLASS}
              accessibilityLabel={saved ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
              <FilledIcon name={saved ? 'heart' : 'heart-outline'} size={22} color={saved ? HEART : colors.white} />
            </IconButton>
            <IconButton
              icon="share"
              iconSize={20}
              size={42}
              color={colors.white}
              background={GLASS}
              onPress={share}
              accessibilityLabel="Compartir"
            />
          </View>
        </View>
      </Photo>

      <AppText variant="h1" accessibilityRole="header" style={styles.title}>
        {place.name}
      </AppText>
      <AppText variant="label" color={colors.inkSoft} style={styles.category}>
        {place.categoryLabel}
      </AppText>

      <View style={styles.ratings}>
        <Rating value={place.rating} count={place.reviews} label="en la app" />
        <AppText style={styles.dot}>·</AppText>
        <Rating value={place.ratingAlt} count={place.reviewsAlt} label="en Google" />
        <AppText style={styles.dot}>·</AppText>
        <AppText variant="body" weight="medium" accessibilityLabel={`Precio ${place.price}`}>
          {place.price}
        </AppText>
      </View>

      <View style={styles.info}>
        <InfoRow icon="map-pin">
          {place.address} · {formatKm(place.distanceKm)}
        </InfoRow>
        <InfoRow icon="clock">
          <AppText style={[styles.status, { color: open ? colors.success : colors.danger }]}>
            {open ? 'Abierto' : 'Cerrado'}
          </AppText>
          {` · ${place.opens} - ${place.closes}`}
        </InfoRow>
      </View>

      <AppText variant="body" style={styles.description}>
        {place.description}
      </AppText>

      <View style={styles.tags}>
        {place.tags.map((tag) => (
          <Chip key={tag} label={tag} tone="tag" size="sm" style={styles.tag} />
        ))}
      </View>

      <FriendsGoing placeId={place.id} />
    </Screen>
  );
}

function Rating({ value, count, label }: { value: number; count: number; label: string }) {
  return (
    <View style={styles.rating} accessibilityLabel={`${value} estrellas ${label}, ${count} reseñas`}>
      <FilledIcon name="star" size={14} color={colors.star} />
      <AppText variant="body" color={colors.textMuted}>
        {value.toFixed(1)} ({count})
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 270, marginTop: 4 },
  heroShade: { position: 'absolute', top: 0, left: 0, right: 0, height: 110 },
  heroBar: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroRight: { flexDirection: 'row', gap: 10 },
  title: { fontFamily: fonts.serifBlack, fontSize: 34, lineHeight: 37, letterSpacing: -0.8, marginTop: 22 },
  category: { marginTop: 8, fontSize: 15 },
  ratings: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { color: colors.textFaint, fontSize: 15 },
  info: { gap: 12, marginTop: 18 },
  status: { fontFamily: fonts.sansSemi, fontSize: 15.5 },
  description: { marginTop: 18, lineHeight: 23, color: colors.inkSoft },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  tag: { height: 34, paddingHorizontal: 14 },
  actions: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
});
