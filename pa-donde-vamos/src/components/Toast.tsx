import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { colors, fonts, radius } from '@/theme';

import { Icon, type IconName } from './Icon';
import { AppText } from './Typography';

type ToastState = { message: string | null; icon: IconName; key: number };

const useToastStore = create<ToastState>(() => ({ message: null, icon: 'check', key: 0 }));

let hideTimer: ReturnType<typeof setTimeout> | undefined;

/** Show a short confirmation at the bottom of the screen ("Guardado en tus lugares"). */
export function showToast(message: string, icon: IconName = 'check') {
  clearTimeout(hideTimer);
  useToastStore.setState((s) => ({ message, icon, key: s.key + 1 }));
  hideTimer = setTimeout(() => useToastStore.setState({ message: null }), 2200);
}

/** Mounted once in the root layout. */
export function ToastHost() {
  const { message, icon, key } = useToastStore();
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: message ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, [message, key, anim]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          bottom: insets.bottom + 96,
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        },
      ]}>
      <Icon name={icon} size={16} color={colors.white} />
      <AppText style={{ color: colors.white, fontFamily: fonts.sansMedium, fontSize: 14 }}>{message ?? ''}</AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.pill,
    maxWidth: '90%',
  },
});
