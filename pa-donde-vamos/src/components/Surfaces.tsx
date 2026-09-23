import { Image, type ImageProps } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

import { Icon, type IconName } from './Icon';
import { AppText } from './Typography';

/** Bordered cream card (friend rows, notifications, settings groups). */
export function Card({
  children,
  onPress,
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  if (!onPress) return <View style={[styles.card, style]}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { backgroundColor: colors.surfaceMuted }, style]}>
      {children}
    </Pressable>
  );
}

/** Rounded photo with optional bottom gradient for text on top. */
export function Photo({
  source,
  style,
  rounded = radius.lg,
  gradient = false,
  children,
  contentFit = 'cover',
}: {
  source: ImageProps['source'];
  style?: StyleProp<ViewStyle>;
  rounded?: number;
  /** Darken the bottom so white text reads well. */
  gradient?: boolean;
  children?: ReactNode;
  contentFit?: ImageProps['contentFit'];
}) {
  return (
    <View style={[{ borderRadius: rounded, overflow: 'hidden', backgroundColor: '#3A2A1C' }, style]}>
      <Image source={source} style={StyleSheet.absoluteFill} contentFit={contentFit} transition={200} />
      {gradient ? (
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.78)']}
          locations={[0.25, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {children}
    </View>
  );
}

/** Row with leading icon, label and chevron (Crear plan categories, Configuración). */
export function MenuRow({
  icon,
  leading,
  label,
  onPress,
  right,
  last,
}: {
  icon?: IconName;
  /** Custom leading node (e.g. an Ionicons icon) instead of `icon`. */
  leading?: ReactNode;
  label: string;
  onPress?: () => void;
  right?: ReactNode;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, !last && styles.menuDivider, pressed && { opacity: 0.6 }]}>
      {leading ?? (icon ? <Icon name={icon} size={20} color={colors.ink} /> : null)}
      <AppText variant="body" style={{ flex: 1 }}>
        {label}
      </AppText>
      {right ?? <Icon name="chevron-right" size={18} color={colors.textFaint} />}
    </Pressable>
  );
}

export function SectionTitle({ children, right }: { children: string; right?: ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <AppText variant="title" style={{ fontSize: 17 }}>
        {children}
      </AppText>
      {right}
    </View>
  );
}

export function Divider({ label }: { label?: string }) {
  if (!label) return <View style={styles.hr} />;
  return (
    <View style={styles.dividerRow}>
      <View style={[styles.hr, { flex: 1 }]} />
      <AppText variant="small">{label}</AppText>
      <View style={[styles.hr, { flex: 1 }]} />
    </View>
  );
}

export function EmptyState({ icon = 'compass', title, body, action }: { icon?: IconName; title: string; body?: string; action?: ReactNode }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={26} color={colors.blue} />
      </View>
      <AppText variant="h3" align="center">
        {title}
      </AppText>
      {body ? (
        <AppText variant="body" color={colors.textMuted} align="center">
          {body}
        </AppText>
      ) : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  menuDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderStrong },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  hr: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderStrong },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 48, paddingHorizontal: 24 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
});
