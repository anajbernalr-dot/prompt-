import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme';

import { IconButton } from './Button';
import { AppText } from './Typography';

/** Goes back, or to a fallback route when there is no history (deep link / web refresh). */
export function goBack(fallback: string = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback as never);
}

export function BackButton({
  color = colors.ink,
  background = 'transparent',
  fallback,
  onPress,
}: {
  color?: string;
  background?: string;
  fallback?: string;
  onPress?: () => void;
}) {
  return (
    <IconButton
      icon="arrow-left"
      iconSize={24}
      color={color}
      background={background}
      accessibilityLabel="Volver"
      onPress={onPress ?? (() => goBack(fallback))}
      style={{ marginLeft: background === 'transparent' ? -8 : 0 }}
    />
  );
}

/**
 * Top bar with back arrow. Title is inline serif (like "Crear plan") when `title` is set,
 * otherwise only the arrow + optional right slot.
 */
export function Header({
  title,
  right,
  fallback,
  style,
  showBack = true,
}: {
  title?: string;
  right?: ReactNode;
  fallback?: string;
  style?: StyleProp<ViewStyle>;
  showBack?: boolean;
}) {
  return (
    <View style={[styles.row, style]}>
      {showBack ? <BackButton fallback={fallback} /> : null}
      {title ? (
        <AppText variant="h3" style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 6, marginBottom: 8 },
  title: { flex: 1, fontSize: 22, lineHeight: 28 },
});
