import { Image } from 'expo-image';
import { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/Button';
import { Photo } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import { photoSource, type PhotoCat, type PhotoRef, type VenuePhoto } from '@/data/venueExtras';
import { colors, fonts, maxContentWidth } from '@/theme';

import { PillRow, SectionHeader } from './parts';

type Filter = 'todo' | PhotoCat;
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'todo', label: 'Todo' },
  { key: 'comida', label: 'Comida' },
  { key: 'ambiente', label: 'Ambiente' },
  { key: 'exterior', label: 'Exterior' },
];
const HEIGHTS = [210, 150, 170, 200, 150, 190, 170, 160, 180];

/** Two-column masonry of photo refs; the first one can span both columns. */
export function Masonry({ refs, onOpen, wideFirst }: { refs: PhotoRef[]; onOpen: (i: number) => void; wideFirst?: boolean }) {
  const start = wideFirst ? 1 : 0;
  const cols: [number[], number[]] = [[], []];
  const h = [0, 0];
  for (let i = start; i < refs.length; i++) {
    const c = h[0] <= h[1] ? 0 : 1;
    cols[c].push(i);
    h[c] += HEIGHTS[i % HEIGHTS.length];
  }
  const tile = (i: number, style: object) => (
    <Pressable key={refs[i] + i} onPress={() => onOpen(i)} accessibilityRole="imagebutton" accessibilityLabel={`Ver foto ${i + 1}`}>
      <Photo source={photoSource(refs[i])} rounded={14} style={style} />
    </Pressable>
  );
  return (
    <View style={styles.grid}>
      {wideFirst && refs.length ? tile(0, styles.wide) : null}
      <View style={styles.cols}>
        {cols.map((col, c) => (
          <View key={c} style={styles.col}>
            {col.map((i) => tile(i, { height: HEIGHTS[i % HEIGHTS.length] }))}
          </View>
        ))}
      </View>
    </View>
  );
}

export function PhotoViewer({ refs, index, onClose }: { refs: PhotoRef[]; index: number | null; onClose: () => void }) {
  const { width: winW, height } = useWindowDimensions();
  const width = Math.min(winW, maxContentWidth);
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const visible = index !== null;
  const ref = useRef<ScrollView>(null);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.viewer}>
        {visible ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            ref={ref}
            onLayout={() => {
              ref.current?.scrollTo({ x: index * width, animated: false });
              setPage(index);
            }}
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
            onScroll={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
            scrollEventThrottle={64}
            style={{ width, height, flexGrow: 0, alignSelf: 'center' }}>
            {refs.map((r, i) => (
              <Pressable key={r + i} onPress={onClose} style={{ width, height }} accessibilityLabel="Cerrar foto">
                <Image source={photoSource(r)} style={styles.full} contentFit="contain" />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
        <View style={[styles.viewerBar, { top: insets.top + 12 }]}>
          <AppText style={styles.counter}>
            {page + 1} / {refs.length}
          </AppText>
          <IconButton icon="x" size={42} color={colors.white} background="rgba(255,255,255,0.16)" onPress={onClose} accessibilityLabel="Cerrar" />
        </View>
      </View>
    </Modal>
  );
}

export function PhotosSection({ photos }: { photos: VenuePhoto[] }) {
  const [filter, setFilter] = useState<Filter>('todo');
  const [all, setAll] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const refs = useMemo(() => photos.filter((p) => filter === 'todo' || p.cat === filter).map((p) => p.ref), [photos, filter]);
  const shown = all ? refs : refs.slice(0, 5);
  return (
    <View style={styles.wrap}>
      <SectionHeader title="Fotos" />
      <PillRow options={FILTERS} value={filter} onChange={setFilter} style={styles.chips} />
      <Masonry refs={shown} onOpen={setOpen} wideFirst />
      {refs.length > shown.length || all ? (
        <Pressable onPress={() => setAll((v) => !v)} accessibilityRole="button" style={styles.moreBtn}>
          <AppText style={styles.moreText}>{all ? 'Ver menos' : 'Ver más fotos'}</AppText>
        </Pressable>
      ) : null}
      <PhotoViewer refs={refs} index={open} onClose={() => setOpen(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 36 },
  chips: { marginTop: 14, marginBottom: 14 },
  grid: { gap: 8 },
  wide: { height: 190 },
  cols: { flexDirection: 'row', gap: 8 },
  col: { flex: 1, gap: 8 },
  moreBtn: {
    alignSelf: 'center',
    marginTop: -22,
    height: 36,
    paddingHorizontal: 26,
    borderRadius: 18,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.white },
  viewer: { flex: 1, backgroundColor: '#08090C', justifyContent: 'center' },
  full: { width: '100%', height: '100%' },
  viewerBar: { position: 'absolute', left: 18, right: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  counter: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.white },
});
