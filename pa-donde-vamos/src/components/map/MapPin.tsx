import { Pressable, StyleSheet, View } from 'react-native';

import type { Spot } from '@/components/home/spots';
import { FilledIcon, type FilledIconName } from '@/components/Icon';
import type { EventCategory } from '@/data/types';
import { colors } from '@/theme';

const EVENT_GLYPH: Record<EventCategory, FilledIconName> = {
  Música: 'musical-notes',
  Arte: 'color-palette',
  Cultura: 'film',
  Gastronomía: 'restaurant',
};

/** Drop pin anchored by its tip at (x, y) px. Events get a round badge with a glyph. */
export function MapPin({
  spot,
  x,
  y,
  selected,
  onPress,
}: {
  spot: Spot;
  x: number;
  y: number;
  selected: boolean;
  onPress: () => void;
}) {
  const isEvent = spot.kind === 'event';
  const size = isEvent ? (selected ? 36 : 28) : selected ? 42 : 31;
  const color = selected ? colors.ink : colors.blue;
  // Height of the whole marker (event badge + pointer).
  const height = isEvent ? size + 7 : size;
  const tip = isEvent ? height : size * 0.93;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${spot.name}, ${spot.meta}`}
      accessibilityState={{ selected }}
      hitSlop={8}
      onPress={onPress}
      style={[
        styles.pin,
        { left: x - size / 2, top: y - tip, width: size, height, zIndex: selected ? 1000 : Math.round(y) },
      ]}>
      <View style={[styles.shadow, { top: tip - 2.5, left: size / 2 - 6 }]} />
      {isEvent ? (
        <View style={{ alignItems: 'center' }}>
          <View
            style={[
              styles.badge,
              { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
            ]}>
            <FilledIcon
              name={spot.event ? EVENT_GLYPH[spot.event.category] : 'ticket'}
              size={size * 0.48}
              color={colors.white}
            />
          </View>
          <View style={[styles.pointer, { borderTopColor: color }]} />
        </View>
      ) : (
        <View style={[styles.glyph, { width: size, height: size }]}>
          <View
            style={[
              styles.hole,
              { width: size * 0.34, height: size * 0.34, borderRadius: size * 0.17, top: size * 0.22 },
            ]}
          />
          <FilledIcon name="location" size={size} color={color} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pin: { position: 'absolute', alignItems: 'center' },
  glyph: { alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  hole: { position: 'absolute', backgroundColor: colors.white },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  pointer: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  shadow: {
    position: 'absolute',
    width: 12,
    height: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(40,30,10,0.14)',
  },
});
