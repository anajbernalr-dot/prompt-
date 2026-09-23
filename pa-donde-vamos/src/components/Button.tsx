import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts, radius } from '@/theme';

import { Icon, type IconName } from './Icon';
import { AppText } from './Typography';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'light';
type Size = 'lg' | 'md' | 'sm';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  iconLeft?: IconName;
  iconRight?: IconName;
  /** Custom node rendered before the label (e.g. a brand logo). */
  leading?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const palette: Record<Variant, { bg: string; fg: string; border: string; pressed: string }> = {
  primary: { bg: colors.ink, fg: colors.white, border: colors.ink, pressed: colors.inkSoft },
  accent: { bg: colors.blue, fg: colors.white, border: colors.blue, pressed: colors.blueInk },
  outline: { bg: 'transparent', fg: colors.text, border: colors.borderStrong, pressed: colors.surfaceMuted },
  ghost: { bg: 'transparent', fg: colors.text, border: 'transparent', pressed: colors.surfaceMuted },
  light: { bg: colors.surface, fg: colors.text, border: colors.border, pressed: colors.surfaceMuted },
};

const heights: Record<Size, number> = { lg: 54, md: 46, sm: 36 };

/** Pill button used across the app ("Empezar →", "Crear cuenta", "Ir ahora →"). */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  iconLeft,
  iconRight,
  leading,
  disabled,
  loading,
  fullWidth = true,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const p = palette[variant];
  const fontSize = size === 'sm' ? 13.5 : size === 'md' ? 15 : 16;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          height: heights[size],
          paddingHorizontal: size === 'sm' ? 16 : 22,
          backgroundColor: pressed ? p.pressed : p.bg,
          borderColor: p.border,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {leading}
          {iconLeft ? <Icon name={iconLeft} size={fontSize + 2} color={p.fg} /> : null}
          <AppText style={{ color: p.fg, fontSize, fontFamily: fonts.sansSemi }} numberOfLines={1}>
            {label}
          </AppText>
          {iconRight ? <Icon name={iconRight} size={fontSize + 3} color={p.fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}

/** Round icon-only button (back arrow, heart, share…). */
export function IconButton({
  icon,
  onPress,
  size = 40,
  iconSize = 20,
  color = colors.text,
  background = 'transparent',
  accessibilityLabel,
  style,
  children,
}: {
  icon?: IconName;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
  color?: string;
  background?: string;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  /** Custom icon node instead of `icon`. */
  children?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: background,
          opacity: pressed ? 0.6 : 1,
        },
        style,
      ]}>
      {children ?? (icon ? <Icon name={icon} size={iconSize} color={color} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
