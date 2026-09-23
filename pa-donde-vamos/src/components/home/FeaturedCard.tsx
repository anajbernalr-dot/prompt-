import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { FilledIcon } from '@/components/Icon';
import { Photo } from '@/components/Surfaces';
import { showToast } from '@/components/Toast';
import { AppText } from '@/components/Typography';
import { tap } from '@/lib/actions';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts } from '@/theme';

import { spotSubtitle, type Spot } from './spots';

/** Big hero photo card on Inicio ("Tostao Specialty Coffee"). */
export function FeaturedCard({ spot }: { spot: Spot }) {
  const isEvent = spot.kind === 'event';
  const saved = useAppStore((s) => (isEvent ? s.savedEvents.includes(spot.id) : s.savedPlaces.includes(spot.id)));

  const open = () => router.push(spot.href);

  const toggleSave = () => {
    tap();
    const store = useAppStore.getState();
    if (isEvent) store.toggleSaveEvent(spot.id);
    else store.toggleSavePlace(spot.id);
    showToast(saved ? 'Quitado de guardados' : 'Guardado', saved ? 'x' : 'heart');
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${spot.name}. ${spotSubtitle(spot)}`}
      onPress={open}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.99 : 1 }] })}>
      <Photo source={spot.image} rounded={22} gradient style={styles.photo}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Quitar de guardados' : 'Guardar'}
          accessibilityState={{ selected: saved }}
          hitSlop={6}
          onPress={toggleSave}
          style={({ pressed }) => [styles.heart, pressed && { opacity: 0.6 }]}>
          <FilledIcon name={saved ? 'heart' : 'heart-outline'} size={25} color={colors.white} />
        </Pressable>

        <View style={styles.bottom}>
          <View style={styles.texts}>
            <AppText style={styles.title} numberOfLines={2}>
              {spot.name}
            </AppText>
            <AppText style={styles.subtitle} numberOfLines={1}>
              {spotSubtitle(spot)}
            </AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${spot.name}`}
            hitSlop={6}
            onPress={open}
            style={({ pressed }) => [styles.go, pressed && { backgroundColor: colors.blueInk }]}>
            <FilledIcon name="arrow-forward" size={22} color={colors.white} />
          </Pressable>
        </View>
      </Photo>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  photo: { height: 240, justifyContent: 'flex-end' },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, paddingHorizontal: 18, paddingBottom: 16 },
  texts: { flex: 1, gap: 6 },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 28,
    lineHeight: 31,
    letterSpacing: -0.5,
    color: colors.white,
  },
  subtitle: { fontFamily: fonts.sansMedium, fontSize: 13.5, color: 'rgba(255,255,255,0.85)' },
  go: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
