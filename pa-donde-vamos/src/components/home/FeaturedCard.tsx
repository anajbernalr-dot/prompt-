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
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${spot.name}. ${spotSubtitle(spot)}`}
        onPress={open}
        style={({ pressed }) => [StyleSheet.absoluteFill, { opacity: pressed ? 0.94 : 1 }]}>
        <Photo source={spot.image} rounded={22} gradient style={styles.photo}>
          <View style={styles.texts}>
            <AppText style={styles.title} numberOfLines={2}>
              {spot.name}
            </AppText>
            <AppText style={styles.subtitle} numberOfLines={1}>
              {spotSubtitle(spot)}
            </AppText>
          </View>
        </Photo>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={saved ? 'Quitar de guardados' : 'Guardar'}
        accessibilityState={{ selected: saved }}
        hitSlop={6}
        onPress={toggleSave}
        style={({ pressed }) => [styles.heart, pressed && { opacity: 0.6 }]}>
        <FilledIcon name={saved ? 'heart' : 'heart-outline'} size={25} color={colors.white} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${spot.name}`}
        hitSlop={6}
        onPress={open}
        style={({ pressed }) => [styles.go, pressed && { backgroundColor: colors.blueInk }]}>
        <FilledIcon name="arrow-forward" size={22} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { height: 250, borderRadius: 22 },
  photo: { flex: 1, justifyContent: 'flex-end' },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { gap: 6, paddingLeft: 18, paddingRight: 76, paddingBottom: 16 },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 28,
    lineHeight: 31,
    letterSpacing: -0.5,
    color: colors.white,
  },
  subtitle: { fontFamily: fonts.sansMedium, fontSize: 13.5, color: 'rgba(255,255,255,0.85)' },
  go: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
