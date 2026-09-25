import { LinearGradient } from 'expo-linear-gradient';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarStack } from '@/components/Avatar';
import { Button, IconButton } from '@/components/Button';
import { BackButton } from '@/components/Header';
import { FilledIcon, Icon } from '@/components/Icon';
import { GlassesDoodle } from '@/components/illustrations';
import { Photo } from '@/components/Surfaces';
import { AppText, Handwritten } from '@/components/Typography';
import { friends } from '@/data/friends';
import { placeImage } from '@/data/images';
import type { Place } from '@/data/types';
import { formatKm } from '@/lib/format';
import { colors, fonts, gutter } from '@/theme';

import { ChefHatDoodle, CupDoodle, StarDoodle } from './parts';

const GLASS = 'rgba(12, 14, 20, 0.38)';
const HEART = '#FF6B6B';
export const HERO_H = 340;

type Actions = { saved: boolean; onSave: () => void; onShare: () => void; onMore: () => void; onGo: () => void };

function subtitle(p: Place) {
  const extra = p.tags.slice(0, 2).filter((t) => !t.toLowerCase().includes('pet'));
  return [p.categoryLabel, ...extra].join(' · ');
}

export function VenueHero({ place, note, wantCount, saved, onSave, onShare, onMore, onGo }: Actions & { place: Place; note: string; wantCount: number }) {
  const insets = useSafeAreaInsets();
  return (
    <View>
      <Photo source={placeImage(place.image)} rounded={0} style={[styles.hero, { height: HERO_H + insets.top }]}>
        <LinearGradient colors={['rgba(0,0,0,0.42)', 'rgba(0,0,0,0)']} style={styles.shade} />
        <View style={[styles.bar, { top: insets.top + 10 }]}>
          <BackButton color={colors.white} background={GLASS} fallback="/" />
          <View style={styles.barRight}>
            <IconButton icon="share" iconSize={19} size={42} color={colors.white} background={GLASS} onPress={onShare} accessibilityLabel="Compartir" />
            <IconButton onPress={onSave} size={42} background={GLASS} accessibilityLabel={saved ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
              <FilledIcon name={saved ? 'heart' : 'heart-outline'} size={21} color={saved ? HEART : colors.white} />
            </IconButton>
            <IconButton icon="more-horizontal" iconSize={20} size={42} color={colors.white} background={GLASS} onPress={onMore} accessibilityLabel="Más opciones" />
          </View>
        </View>
      </Photo>

      <View style={styles.body}>
        <AppText accessibilityRole="header" style={styles.title}>
          {place.name}
        </AppText>
        <AppText style={styles.sub}>{subtitle(place)}</AppText>
        <View style={styles.row}>
          <FilledIcon name="star" size={15} color={colors.star} />
          <AppText style={styles.meta}>
            {place.rating.toFixed(1)} <AppText style={styles.muted}>({place.reviews})</AppText>
            <AppText style={styles.muted}> · </AppText>
            {place.price}
          </AppText>
        </View>
        <View style={styles.row}>
          <Icon name="map-pin" size={15} color={colors.ink} />
          <AppText style={styles.meta}>
            {place.address} <AppText style={styles.muted}>·</AppText> {formatKm(place.distanceKm)}
          </AppText>
        </View>
        <View style={[styles.row, styles.want]}>
          <AvatarStack people={friends.slice(0, 3)} size={28} max={3} />
          <AppText style={styles.wantText}>{wantCount} panas quieren ir</AppText>
        </View>

        <View style={styles.doodle} pointerEvents="none">
          {place.category === 'bar' ? <GlassesDoodle width={96} /> : place.category === 'restaurante' ? <ChefHatDoodle width={70} /> : <CupDoodle width={120} />}
          <View style={styles.noteBox}>
            <Handwritten rotate={-8} size={21} style={styles.note}>
              {note.toUpperCase()}
            </Handwritten>
            <StarDoodle width={26} style={styles.star} />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            label={saved ? 'Guardado' : 'Guardar'}
            size="md"
            leading={<FilledIcon name={saved ? 'bookmark' : 'bookmark-outline'} size={17} color={colors.white} />}
            onPress={onSave}
            style={styles.flex}
          />
          <Button label="Ir ahora" size="md" variant="outline" iconRight="arrow-right" onPress={onGo} style={styles.flex} />
        </View>
      </View>
    </View>
  );
}

/** Mini header that fades in once the hero scrolls away. */
export function StickyHeader({ visible, title, progress, saved, onSave }: { visible: boolean; title: string; progress: Animated.AnimatedInterpolation<number>; saved: boolean; onSave: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[styles.sticky, { paddingTop: insets.top + 6, opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] }]}>
      <BackButton fallback="/" />
      <AppText style={styles.stickyTitle} numberOfLines={1}>
        {title}
      </AppText>
      <IconButton onPress={onSave} size={40} accessibilityLabel={saved ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
        <FilledIcon name={saved ? 'heart' : 'heart-outline'} size={21} color={saved ? HEART : colors.ink} />
      </IconButton>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: { borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  shade: { position: 'absolute', top: 0, left: 0, right: 0, height: 130 },
  bar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  barRight: { flexDirection: 'row', gap: 8 },
  body: { paddingHorizontal: gutter, paddingTop: 20 },
  title: { fontFamily: fonts.serifBlack, fontSize: 36, lineHeight: 39, letterSpacing: -0.8, color: colors.ink },
  sub: { fontFamily: fonts.sans, fontSize: 15, color: colors.inkSoft, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  meta: { fontFamily: fonts.sansMedium, fontSize: 14.5, color: colors.ink },
  muted: { fontFamily: fonts.sans, color: colors.textMuted },
  want: { marginTop: 14 },
  wantText: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.inkSoft },
  doodle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 6 },
  noteBox: { alignItems: 'flex-end', marginRight: 4 },
  note: { textAlign: 'center' },
  star: { marginTop: 4, transform: [{ rotate: '12deg' }] },
  actions: { flexDirection: 'row', gap: 12, marginTop: 18 },
  flex: { flex: 1 },
  sticky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  stickyTitle: { flex: 1, fontFamily: fonts.serifBold, fontSize: 18, color: colors.ink },
});
