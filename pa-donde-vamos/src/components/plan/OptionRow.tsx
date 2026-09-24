import type { ImageProps } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Photo } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import { tap } from '@/lib/actions';
import { colors, radius } from '@/theme';

/** Selectable place/event row used in the create-plan flow (thumb, name, meta, radio). */
export function OptionRow({
  image,
  title,
  meta,
  detail,
  selected,
  onPress,
  leading,
}: {
  image?: ImageProps['source'];
  title: string;
  meta?: string;
  detail?: string;
  selected: boolean;
  onPress: () => void;
  leading?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={[title, meta, detail].filter(Boolean).join(', ')}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.row, selected && styles.rowSelected, pressed && { opacity: 0.85 }]}>
      {leading ?? (image ? <Photo source={image} rounded={12} style={styles.thumb} /> : null)}
      <View style={styles.text}>
        <AppText variant="title" numberOfLines={1}>
          {title}
        </AppText>
        {meta ? (
          <AppText variant="small" numberOfLines={1}>
            {meta}
          </AppText>
        ) : null}
        {detail ? (
          <AppText variant="small" color={colors.textFaint} numberOfLines={1}>
            {detail}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <Icon name="check" size={14} color={colors.white} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 10,
    paddingRight: 16,
    borderRadius: radius.lg + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  rowSelected: { borderColor: colors.blue, backgroundColor: colors.surface },
  thumb: { width: 60, height: 60 },
  text: { flex: 1, gap: 2 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: colors.blue, borderColor: colors.blue },
});
