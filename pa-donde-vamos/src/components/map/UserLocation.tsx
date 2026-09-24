import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

const HALO = 64;

/** "You are here": blue dot with white ring and a pulsing halo, centered at (x, y) px. */
export function UserLocation({ x, y }: { x: number; y: number }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View
      pointerEvents="none"
      accessibilityLabel="Tu ubicación"
      style={[styles.wrap, { left: x - HALO / 2, top: y - HALO / 2 }]}>
      <View style={styles.halo} />
      <Animated.View
        style={[
          styles.pulse,
          {
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1.35] }) }],
          },
        ]}
      />
      <View style={styles.dot} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', width: HALO, height: HALO, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: HALO * 0.78,
    height: HALO * 0.78,
    borderRadius: HALO,
    backgroundColor: 'rgba(36, 81, 245, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(36, 81, 245, 0.22)',
  },
  pulse: {
    position: 'absolute',
    width: HALO,
    height: HALO,
    borderRadius: HALO / 2,
    backgroundColor: colors.blue,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.blue,
    borderWidth: 3,
    borderColor: colors.white,
    boxShadow: '0 1px 4px rgba(26, 42, 108, 0.35)',
  },
});
