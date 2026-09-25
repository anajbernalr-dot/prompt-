import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText, Title } from '@/components/Typography';
import { colors, fonts, radius } from '@/theme';

export function SectionHeader({ title, right, style }: { title: string; right?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.header, style]}>
      <Title level={2} style={styles.title}>
        {title}
      </Title>
      {right}
    </View>
  );
}

/** Small selectable pill; `tone='blue'` = blue when selected (plan form), default = ink. */
export function Pill({
  label,
  selected,
  onPress,
  tone = 'ink',
  round,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  tone?: 'ink' | 'blue';
  round?: boolean;
}) {
  const bg = selected ? (tone === 'blue' ? colors.blue : colors.ink) : 'transparent';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.pill,
        round && styles.round,
        { backgroundColor: bg, borderColor: selected ? bg : colors.borderStrong, opacity: pressed ? 0.75 : 1 },
      ]}>
      <AppText style={[styles.pillText, { color: selected ? colors.white : colors.ink }]} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function PillRow<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: readonly { key: T; label: string }[];
  value: T;
  onChange: (k: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.pillRow, style]}>
      {options.map((o) => (
        <Pill key={o.key} label={o.label} selected={o.key === value} onPress={() => onChange(o.key)} />
      ))}
    </View>
  );
}

const S = { stroke: colors.blue, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

export function CupDoodle({ width = 110, style }: { width?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Svg width={width} height={width * 0.72} viewBox="0 0 110 80" style={style}>
      <Path d="M22 14c-3 4 3 7 0 11M30 12c-3 4 3 7 0 11M38 14c-3 4 3 7 0 11" {...S} />
      <Path d="M14 33c1 14 6 25 20 25s20-10 21-25z" {...S} />
      <Path d="M55 38c8-2 11 7 3 11-2 1-4 1-5 1" {...S} />
      <Path d="M8 62c14 5 40 5 54-1" {...S} />
      <Path d="M76 46c7-3 15-2 18 3 2 5-4 9-12 9s-10-8-6-12z" {...S} />
      <Path d="M80 52c4-1 8-1 11 1" {...S} />
      <Path d="M70 16l4 6M86 12l-2 8M92 22l-7 3" {...S} />
      <Path d="M62 30l3-3M98 36l3-2" {...S} />
    </Svg>
  );
}

export function ChefHatDoodle({ width = 44, style }: { width?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Svg width={width} height={width * 1.1} viewBox="0 0 44 48" style={style}>
      <Path d="M12 24c-7-1-8-11-1-13 1-6 9-9 13-4 4-4 12-2 12 4 7 1 7 12-1 13" {...S} />
      <Path d="M12 24v8h22v-8M12 29h22" {...S} />
      <Path d="M15 36c0 6 16 6 16 0M18 40c3 1 7 1 10 0" {...S} />
      <Path d="M3 14l3 2M40 6l-3 3M4 30l3-1" {...S} />
    </Svg>
  );
}

export function ArrowDoodle({ width = 40, style }: { width?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Svg width={width} height={width} viewBox="0 0 40 40" style={style}>
      <Path d="M34 6C24 10 14 20 8 32" {...S} />
      <Path d="M6 20l2 13 12-3" {...S} />
      <Circle cx={30} cy={30} r={1.6} fill={colors.blue} />
    </Svg>
  );
}

export function StarDoodle({ width = 26, style }: { width?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Svg width={width} height={width} viewBox="0 0 26 26" style={style}>
      <Path d="M13 2l3 7.5 8 .7-6 5.3 1.9 8L13 19.3 6.1 23.5 8 15.5 2 10.2l8-.7z" {...S} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  title: { fontSize: 25, lineHeight: 30 },
  pill: {
    height: 36,
    minWidth: 44,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  round: { width: 44, height: 44, paddingHorizontal: 0 },
  pillText: { fontFamily: fonts.sansMedium, fontSize: 13 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
