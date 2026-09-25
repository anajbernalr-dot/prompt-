import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, AvatarStack } from '@/components/Avatar';
import { FilledIcon, Icon } from '@/components/Icon';
import { Photo } from '@/components/Surfaces';
import { AppText, Handwritten } from '@/components/Typography';
import { friends, getFriend } from '@/data/friends';
import { placeImage } from '@/data/images';
import { places } from '@/data/places';
import type { Place } from '@/data/types';
import { photoSource, type FriendPost, type MenuItem, type PhotoRef } from '@/data/venueExtras';
import { tap } from '@/lib/actions';
import { formatKm } from '@/lib/format';
import { colors, fonts } from '@/theme';

import { ArrowDoodle, ChefHatDoodle, PillRow, SectionHeader, StarDoodle } from './parts';
import { PhotoViewer } from './Photos';

const HEART = '#FF6B6B';
type PostFilter = 'todo' | 'comentarios' | 'fotos';
const POST_FILTERS: { key: PostFilter; label: string }[] = [
  { key: 'todo', label: 'Todo' },
  { key: 'comentarios', label: 'Comentarios' },
  { key: 'fotos', label: 'Fotos' },
];

const ago = (h: number) => (h < 24 ? `${Math.round(h)} h` : h < 168 ? `${Math.round(h / 24)} días` : '1 semana');

export function FriendPosts({ posts, zone }: { posts: FriendPost[]; zone: string }) {
  const [filter, setFilter] = useState<PostFilter>('todo');
  const [liked, setLiked] = useState<string[]>([]);
  const shown = posts.filter((p) => (filter === 'fotos' ? !!p.photo : filter === 'comentarios' ? !p.photo : true));
  return (
    <View style={styles.wrap}>
      <SectionHeader title="De tus panas" />
      <PillRow options={POST_FILTERS} value={filter} onChange={setFilter} style={styles.chips} />
      {shown.map((p, i) => {
        const f = getFriend(p.friendId);
        if (!f) return null;
        const on = liked.includes(p.id);
        return (
          <View key={p.id} style={[styles.post, i > 0 && styles.sep]}>
            <View style={styles.postHead}>
              <Avatar name={f.name} image={f.avatar} size={36} />
              <View style={styles.flex}>
                <AppText style={styles.name}>{f.name}</AppText>
                <AppText style={styles.muted}>
                  {ago(p.hoursAgo)} · {zone}
                </AppText>
              </View>
              <Pressable onPress={() => router.push(`/chat/${f.id}`)} accessibilityRole="button" accessibilityLabel={`Escribirle a ${f.name}`} hitSlop={8} style={styles.iconBtn}>
                <Icon name="more-vertical" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
            <AppText style={styles.postText}>{p.text}</AppText>
            {p.photo ? <Photo source={photoSource(p.photo)} rounded={14} style={styles.postPhoto} /> : null}
            <View style={styles.counts}>
              <Pressable
                onPress={() => {
                  tap();
                  setLiked((l) => (on ? l.filter((x) => x !== p.id) : [...l, p.id]));
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel="Me gusta"
                hitSlop={8}
                style={styles.count}>
                <FilledIcon name={on ? 'heart' : 'heart-outline'} size={17} color={on ? HEART : colors.inkSoft} />
                <AppText style={styles.countText}>{p.likes + (on ? 1 : 0)}</AppText>
              </Pressable>
              <Pressable onPress={() => router.push(`/chat/${f.id}`)} accessibilityRole="button" accessibilityLabel="Comentar" hitSlop={8} style={styles.count}>
                <Icon name="message-circle" size={16} color={colors.inkSoft} />
                <AppText style={styles.countText}>{p.comments}</AppText>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function MenuSection({ items }: { items: MenuItem[] }) {
  const [liked, setLiked] = useState<string[]>([]);
  return (
    <View style={styles.wrap}>
      <SectionHeader title="Platos favoritos" right={<ChefHatDoodle width={42} style={styles.hat} />} />
      {items.map((m, i) => {
        const on = liked.includes(m.name);
        return (
          <View key={m.name} style={[styles.dish, i > 0 && styles.sep]}>
            <Photo source={photoSource(m.image)} rounded={14} style={styles.dishPhoto} />
            <View style={styles.flex}>
              <AppText style={styles.name}>{m.name}</AppText>
              <AppText style={styles.price}>{m.price}</AppText>
              <View style={styles.counts}>
                <View style={styles.count}>
                  <FilledIcon name="star" size={13} color={colors.star} />
                  <AppText style={styles.countText}>{m.score.toFixed(1)}</AppText>
                </View>
                <Pressable
                  onPress={() => {
                    tap();
                    setLiked((l) => (on ? l.filter((x) => x !== m.name) : [...l, m.name]));
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Me gusta ${m.name}`}
                  accessibilityState={{ selected: on }}
                  hitSlop={8}
                  style={styles.count}>
                  <FilledIcon name={on ? 'heart' : 'heart-outline'} size={15} color={on ? HEART : colors.inkSoft} />
                  <AppText style={styles.countText}>({m.likes + (on ? 1 : 0)})</AppText>
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function FriendGallery({ name, refs, note, extra }: { name: string; refs: PhotoRef[]; note: string; extra: number }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <View style={styles.wrap}>
      <SectionHeader title="Galería de amigos" />
      <AppText style={styles.sub}>{name}</AppText>
      <Pressable onPress={() => router.push('/friends')} accessibilityRole="button" accessibilityLabel="Ver panas">
        <AvatarStack people={friends} size={40} max={5} extra={extra} style={styles.stack} />
      </Pressable>
      <View style={styles.gCols}>
        {[0, 1].map((c) => (
          <View key={c} style={styles.flex}>
            {refs.slice(0, 5).map((r, i) =>
              i % 2 === c ? (
                <Pressable key={r + i} onPress={() => setOpen(i)} accessibilityRole="imagebutton" accessibilityLabel={`Ver foto ${i + 1}`}>
                  <Photo source={photoSource(r)} rounded={12} style={styles.gPhoto} />
                </Pressable>
              ) : null,
            )}
            {c === 1 ? (
              <View style={styles.galleryNote} pointerEvents="none">
                <Handwritten rotate={-10} size={22} style={styles.center}>
                  {note.toUpperCase()}
                </Handwritten>
                <StarDoodle width={24} style={styles.noteStar} />
              </View>
            ) : null}
          </View>
        ))}
      </View>
      <PhotoViewer refs={refs} index={open} onClose={() => setOpen(null)} />
    </View>
  );
}

function dist(a: Place, b: Place) {
  return Math.hypot(a.lat - b.lat, (a.lng - b.lng) * Math.cos((a.lat * Math.PI) / 180));
}

export function SimilarPlaces({ place }: { place: Place }) {
  const list = useMemo(() => {
    const others = places.filter((p) => p.id !== place.id).sort((a, b) => dist(place, a) - dist(place, b));
    const same = others.filter((p) => p.category === place.category);
    return [...same, ...others.filter((p) => p.category !== place.category)].slice(0, 4);
  }, [place]);
  const label = place.category === 'cafe' ? 'Cafés' : place.category === 'bar' ? 'Bares' : 'Restaurantes';
  return (
    <View style={styles.wrap}>
      <SectionHeader title="Lugares parecidos" right={<ArrowDoodle width={34} />} />
      <AppText style={styles.sub}>{label} y planes en la zona</AppText>
      {list.map((p, i) => (
        <Pressable
          key={p.id}
          onPress={() => router.push(`/place/${p.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`Ver ${p.name}`}
          style={({ pressed }) => [styles.similar, i > 0 && styles.sep, { opacity: pressed ? 0.7 : 1 }]}>
          <Photo source={placeImage(p.image)} rounded={12} style={styles.simPhoto} />
          <View style={styles.flex}>
            <AppText style={styles.name} numberOfLines={1}>
              {p.name}
            </AppText>
            <AppText style={styles.muted}>
              {p.categoryLabel} · {p.zone}
            </AppText>
            <View style={styles.counts}>
              <FilledIcon name="star" size={13} color={colors.star} />
              <AppText style={styles.muted}>
                {p.rating.toFixed(1)} ({p.reviews}) · {formatKm(dist(place, p) * 111)}
              </AppText>
            </View>
          </View>
          <Icon name="chevron-right" size={18} color={colors.textMuted} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  wrap: { marginTop: 40 },
  chips: { marginTop: 14, marginBottom: 4 },
  sub: { fontFamily: fonts.sans, fontSize: 14, color: colors.inkSoft, marginTop: 4 },
  sep: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  post: { paddingVertical: 14 },
  postHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.ink },
  muted: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textMuted },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  postText: { fontFamily: fonts.sans, fontSize: 14.5, lineHeight: 20, color: colors.ink, marginTop: 10 },
  postPhoto: { height: 170, marginTop: 10 },
  counts: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  count: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 28 },
  countText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.inkSoft },
  hat: { marginTop: -8 },
  dish: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12 },
  dishPhoto: { width: 86, height: 86 },
  price: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.inkSoft, marginTop: 4 },
  stack: { marginTop: 14, marginBottom: 16 },
  gCols: { flexDirection: 'row', gap: 8 },
  gPhoto: { height: 150, marginBottom: 8 },
  galleryNote: { flex: 1, minHeight: 130, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  noteStar: { alignSelf: 'flex-end', marginTop: 2 },
  similar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  simPhoto: { width: 76, height: 66 },
});
