import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/Typography';
import { colors, fonts, radius } from '@/theme';

export type Stat = { key: string; value: number; label: string; onPress: () => void };

/** Three counters in a bordered card, separated by hairlines. */
export function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <View style={styles.card}>
      {stats.map((s, i) => (
        <Pressable
          key={s.key}
          accessibilityRole="button"
          accessibilityLabel={`${s.value} ${s.label}`}
          onPress={s.onPress}
          style={({ pressed }) => [styles.cell, i > 0 && styles.divider, pressed && styles.pressed]}>
          <AppText style={styles.value}>{s.value}</AppText>
          <AppText variant="small" color={colors.textMuted}>
            {s.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 2, minHeight: 72 },
  divider: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.borderStrong },
  pressed: { backgroundColor: colors.surfaceMuted },
  value: { fontFamily: fonts.sansSemi, fontSize: 24, lineHeight: 29, color: colors.ink },
});
