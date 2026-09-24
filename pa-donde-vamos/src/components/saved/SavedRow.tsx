import type { ImageProps } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Card, Photo } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import { colors, fonts, radius } from '@/theme';

/** Bordered row with a 64px thumbnail, title, meta line and chevron (Guardados). */
export function SavedRow({
  image,
  fallbackIcon = 'calendar',
  title,
  meta,
  extra,
  onPress,
  dimmed,
}: {
  image?: ImageProps['source'];
  /** Shown instead of the photo when there is none (custom "Otro" plans). */
  fallbackIcon?: IconName;
  title: string;
  meta: string;
  extra?: ReactNode;
  onPress: () => void;
  dimmed?: boolean;
}) {
  return (
    <Card onPress={onPress} accessibilityLabel={`${title}. ${meta}`} style={[styles.card, dimmed && styles.dimmed]}>
      {image ? (
        <Photo source={image} rounded={12} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.placeholder]}>
          <Icon name={fallbackIcon} size={24} color={colors.blue} />
        </View>
      )}
      <View style={styles.body}>
        <AppText variant="title" numberOfLines={2} style={styles.title}>
          {title}
        </AppText>
        <AppText variant="small" numberOfLines={1}>
          {meta}
        </AppText>
        {extra}
      </View>
      <Icon name="chevron-right" size={20} color={colors.textFaint} />
    </Card>
  );
}

/** Small blue pill, e.g. "🎟️ 2 entradas". */
export function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <AppText style={styles.badgeText}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 10,
    paddingRight: 14,
    borderRadius: 18,
  },
  dimmed: { opacity: 0.55 },
  thumb: { width: 64, height: 64, borderRadius: radius.md },
  placeholder: { backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 3 },
  title: { fontSize: 16.5 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.blueSoft,
  },
  badgeText: { fontFamily: fonts.sansSemi, fontSize: 12, lineHeight: 16, color: colors.blueInk },
});
