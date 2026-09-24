import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { ChipRow } from '@/components/Chip';
import { Segmented } from '@/components/Fields';
import { FILTERS, featuredFor, spotsFor, type FilterKey } from '@/components/home/spots';
import { CityMap } from '@/components/map/CityMap';
import { MapPin } from '@/components/map/MapPin';
import { MapPreview } from '@/components/map/MapPreview';
import { UserLocation } from '@/components/map/UserLocation';
import { Screen } from '@/components/Screen';
import { Title } from '@/components/Typography';
import { tap } from '@/lib/actions';

const VIEWS = [
  { key: 'mapa', label: 'Mapa' },
  { key: 'lista', label: 'Lista' },
] as const;

/** Where "you" are on the stylized map (fractions of the box). */
const ME = { x: 0.5, y: 0.57 };

export default function MapScreen() {
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const [filter, setFilter] = useState<FilterKey>('todo');
  const [selectedId, setSelectedId] = useState(focus ?? 'tostao');
  const [lastFocus, setLastFocus] = useState(focus);
  const [box, setBox] = useState({ width: 0, height: 0 });

  // The tab stays mounted: follow new ?focus= params when arriving again from another screen.
  if (focus !== lastFocus) {
    setLastFocus(focus);
    if (focus) {
      setSelectedId(focus);
      setFilter('todo');
    }
  }

  const spots = useMemo(() => spotsFor(filter), [filter]);
  const selected = spots.find((s) => s.id === selectedId) ?? featuredFor(filter) ?? spots[0];
  // Draw lower pins on top of higher ones so the tips stay visible.
  const ordered = useMemo(() => [...spots].sort((a, b) => a.map.y - b.map.y), [spots]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (Math.abs(width - box.width) > 0.5 || Math.abs(height - box.height) > 0.5) setBox({ width, height });
  };

  const select = (id: string) => {
    tap();
    setSelectedId(id);
  };

  return (
    <Screen scroll={false} safeBottom={false} contentStyle={styles.content}>
      <Title style={styles.title}>Mapa</Title>
      <Segmented
        options={VIEWS}
        value="mapa"
        onChange={(k) => {
          if (k === 'lista') router.navigate('/explore');
        }}
        style={styles.segmented}
      />
      <ChipRow options={FILTERS} value={filter} onChange={setFilter} style={styles.chips} />

      <View style={styles.map}>
        <View style={StyleSheet.absoluteFill} onLayout={onLayout} />
        {box.width > 0 ? (
          <>
            <CityMap width={box.width} height={box.height} />
            <UserLocation x={ME.x * box.width} y={ME.y * box.height} />
            {ordered.map((s) => (
              <MapPin
                key={s.id}
                spot={s}
                x={s.map.x * box.width}
                y={s.map.y * box.height}
                selected={s.id === selected?.id}
                onPress={() => select(s.id)}
              />
            ))}
          </>
        ) : null}
      </View>

      {selected ? (
        <View style={styles.preview}>
          <MapPreview spot={selected} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 14 },
  title: { fontSize: 36, lineHeight: 42, marginTop: 12 },
  segmented: { marginTop: 16 },
  chips: { marginTop: 14 },
  map: {
    flex: 1,
    minHeight: 220,
    marginTop: 14,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#E7E4D5',
  },
  preview: { marginTop: -10 },
});
