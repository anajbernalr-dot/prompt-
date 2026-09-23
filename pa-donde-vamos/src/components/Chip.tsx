import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts, gutter, radius } from '@/theme';

import { Icon, type IconName } from './Icon';
import { AppText } from './Typography';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  /** 'filter' = pill filter (Todo/Café…), 'tag' = static tag, 'accent' = blue pill (e.g. "Música"). */
  tone?: 'filter' | 'tag' | 'accent' | 'dashed';
  size?: 'md' | 'sm';
  style?: StyleProp<ViewStyle>;
};

export function Chip({ label, selected, onPress, icon, tone = 'filter', size = 'md', style }: ChipProps) {
  const isSelected = tone === 'filter' && selected;
  const bg =
    tone === 'accent' ? colors.blue : isSelected ? colors.ink : tone === 'dashed' ? 'transparent' : colors.surfaceMuted;
  const fg = tone === 'accent' || isSelected ? colors.white : tone === 'dashed' ? colors.textMuted : colors.text;
  const content = (
    <View
      style={[
        styles.chip,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: bg },
        tone === 'dashed' && styles.dashed,
        style,
      ]}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 12 : 14} color={fg} /> : null}
      <AppText
        style={{ color: fg, fontFamily: fonts.sansMedium, fontSize: size === 'sm' ? 12.5 : 14 }}
        numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
      {content}
    </Pressable>
  );
}

/** Horizontally scrolling row of filter chips that bleeds to the screen edges. */
export function ChipRow<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: readonly { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[{ marginHorizontal: -gutter, flexGrow: 0 }, style]}
      contentContainerStyle={{ paddingHorizontal: gutter, gap: 8 }}>
      {options.map((o) => (
        <Chip key={o.key} label={o.label} selected={o.key === value} onPress={() => onChange(o.key)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  md: { height: 38, paddingHorizontal: 16 },
  sm: { height: 30, paddingHorizontal: 12 },
  dashed: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderStrong },
});
