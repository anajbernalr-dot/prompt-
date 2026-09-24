import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { eventSpot, placeSpot } from '@/components/home/spots';
import { SearchBar } from '@/components/Fields';
import { Icon } from '@/components/Icon';
import { Photo } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import { events } from '@/data/events';
import { places } from '@/data/places';
import { colors, fonts, radius } from '@/theme';

import type { ReviewTarget } from './data';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** List of places + events to choose what to review. */
export function TargetPicker({ onPick }: { onPick: (t: ReviewTarget) => void }) {
  const [q, setQ] = useState('');
  const spots = useMemo(() => {
    const all = [...places.map(placeSpot), ...events.map(eventSpot)];
    const n = norm(q.trim());
    return n ? all.filter((s) => norm(`${s.name} ${s.meta}`).includes(n)) : all;
  }, [q]);

  return (
    <View>
      <SearchBar value={q} onChangeText={setQ} placeholder="Busca el lugar o evento…" />
      <View style={styles.list}>
        {spots.map((s) => (
          <Pressable
            key={`${s.kind}-${s.id}`}
            onPress={() => onPick({ kind: s.kind, id: s.id })}
            accessibilityRole="button"
            accessibilityLabel={`Reseñar ${s.name}`}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceMuted }]}>
            <Photo source={s.image} rounded={14} style={styles.thumb} />
            <View style={styles.flex}>
              <AppText style={styles.name} numberOfLines={1}>
                {s.name}
              </AppText>
              <AppText style={styles.meta} numberOfLines={1}>
                {s.meta}
              </AppText>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
        ))}
        {spots.length === 0 ? (
          <AppText style={styles.meta}>No encontramos nada con “{q}”.</AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { marginTop: 14, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderRadius: radius.lg, minHeight: 68 },
  thumb: { width: 54, height: 54 },
  name: { fontFamily: fonts.sansSemi, fontSize: 15.5, color: colors.ink },
  meta: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted, marginTop: 2 },
});
