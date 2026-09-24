import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/Button';
import { ChipRow } from '@/components/Chip';
import { SearchBar } from '@/components/Fields';
import { PlanCta } from '@/components/home/PlanCta';
import { PlanRow } from '@/components/home/PlanRow';
import { SpotCard } from '@/components/home/SpotCard';
import { FILTER_CATEGORY, FILTERS, nearbyFor, type FilterKey } from '@/components/home/spots';
import { Icon } from '@/components/Icon';
import { Asterisk } from '@/components/illustrations';
import { targetInfo, useAllReviews, useAuthorResolver } from '@/components/reviews/data';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Screen } from '@/components/Screen';
import { Card, SectionTitle } from '@/components/Surfaces';
import { AppText, Handwritten, Title } from '@/components/Typography';
import { getEvent } from '@/data/events';
import { getPlace } from '@/data/places';
import { firstName } from '@/lib/format';
import { selectUnreadCount, sortPlans, useAppStore } from '@/store/useAppStore';
import { colors, fonts, gutter, radius } from '@/theme';

export default function HomeScreen() {
  const userName = useAppStore((s) => s.user?.name ?? '');
  const unread = useAppStore(selectUnreadCount);
  const plans = useAppStore((s) => s.plans);
  const [filter, setFilter] = useState<FilterKey>('todo');
  const [now] = useState(() => Date.now());

  const nearby = useMemo(() => nearbyFor(filter).slice(0, 6), [filter]);
  const allReviews = useAllReviews();
  const resolve = useAuthorResolver();
  const feed = useMemo(() => {
    const cat = FILTER_CATEGORY[filter];
    return allReviews.filter((r) => {
      if (filter === 'todo') return true;
      const t = targetInfo(r.target);
      if (!t) return false;
      return filter === 'eventos' ? t.kind === 'event' : t.category === cat;
    });
  }, [allReviews, filter]);

  const upcoming = useMemo(() => {
    const cat = FILTER_CATEGORY[filter];
    return sortPlans(plans)
      .filter((p) => new Date(p.date).getTime() >= now)
      .filter((p) => {
        if (filter === 'todo') return true;
        if (filter === 'eventos') return !!getEvent(p.eventId);
        return getPlace(p.placeId)?.category === cat;
      })
      .slice(0, 3);
  }, [plans, filter, now]);

  const hello = firstName(userName);

  return (
    <Screen safeBottom={false} contentStyle={styles.content}>
      <View style={styles.helloRow}>
        <AppText style={styles.hello} numberOfLines={1}>
          {hello ? `Hola, ${hello}` : 'Hola'}
        </AppText>
        <Pressable
          onPress={() => router.push('/review/new')}
          accessibilityRole="button"
          accessibilityLabel="Escribir una reseña"
          style={({ pressed }) => [styles.reviewPill, pressed && { opacity: 0.8 }]}>
          <Icon name="plus" size={16} color={colors.white} />
          <AppText style={styles.reviewPillText}>Reseñar</AppText>
        </Pressable>
        <IconButton
          accessibilityLabel={unread > 0 ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'}
          size={44}
          onPress={() => router.push('/notifications')}>
          <View>
            <Icon name="bell" size={23} color={colors.ink} />
            {unread > 0 ? <View style={styles.dot} /> : null}
          </View>
        </IconButton>
      </View>
      <Title style={styles.headline}>¿Qué hacemos hoy?</Title>

      <SearchBar onPress={() => router.push('/explore?focus=1')} style={styles.search} />

      <ChipRow options={FILTERS} value={filter} onChange={setFilter} style={styles.chips} />

      <View style={styles.feedHead}>
        <Handwritten rotate={-4} size={21}>
          Lo que dicen tus panas
        </Handwritten>
        <Asterisk width={20} style={styles.feedAsterisk} />
      </View>

      {feed.length === 0 ? (
        <View style={styles.empty}>
          <AppText style={styles.emptyText}>Nadie ha reseñado nada por aquí todavía.</AppText>
          <Pressable onPress={() => router.push('/review/new')} accessibilityRole="button" hitSlop={8}>
            <AppText style={styles.link}>Sé el primero →</AppText>
          </Pressable>
        </View>
      ) : null}

      {feed.map((r, i) => {
        const author = resolve(r.authorId);
        if (!author) return null;
        return (
          <View key={r.id}>
            {i > 0 && i !== 2 ? <View style={styles.sep} /> : null}
            <ReviewCard review={r} author={author} />
            {i === 1 || (i === feed.length - 1 && feed.length < 2) ? (
              <Interlude nearby={nearby} upcoming={upcoming} />
            ) : null}
          </View>
        );
      })}

      {feed.length === 0 ? <Interlude nearby={nearby} upcoming={upcoming} /> : null}

      <View style={styles.section}>
        <PlanCta />
      </View>
    </Screen>
  );
}

function Interlude({ nearby, upcoming }: { nearby: ReturnType<typeof nearbyFor>; upcoming: ReturnType<typeof sortPlans> }) {
  return (
    <View style={styles.interlude}>
      {nearby.length ? (
        <View>
          <SectionTitle right={<LinkText label="Ver mapa" onPress={() => router.push('/map')} />}>
            Cerca de ti
          </SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bleed}
            contentContainerStyle={styles.rail}>
            {nearby.map((s) => (
              <SpotCard key={s.id} spot={s} width={140} height={130} />
            ))}
          </ScrollView>
        </View>
      ) : null}
      {upcoming.length ? (
        <View style={styles.section}>
          <SectionTitle right={<LinkText label="Ver todos" onPress={() => router.push('/saved?tab=planes')} />}>
            Tus próximos planes
          </SectionTitle>
          <Card style={styles.plansCard}>
            {upcoming.map((p, i) => (
              <PlanRow key={p.id} plan={p} last={i === upcoming.length - 1} />
            ))}
          </Card>
        </View>
      ) : null}
    </View>
  );
}

function LinkText({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" hitSlop={12} onPress={onPress}>
      {({ pressed }) => (
        <AppText style={[styles.link, pressed && { opacity: 0.6 }]}>{label}</AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
  helloRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  hello: { flex: 1, fontFamily: fonts.sansSemi, fontSize: 24, lineHeight: 30, color: colors.ink },
  dot: {
    position: 'absolute',
    top: 0,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.blue,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  headline: { fontSize: 34, lineHeight: 39, marginTop: 2 },
  search: { marginTop: 20 },
  chips: { marginTop: 18, marginBottom: 20 },
  section: { marginTop: 28 },
  bleed: { marginHorizontal: -gutter, flexGrow: 0 },
  rail: { paddingHorizontal: gutter, gap: 12 },
  plansCard: { paddingVertical: 4 },
  reviewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 36,
    paddingHorizontal: 13,
    marginRight: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  reviewPillText: { fontFamily: fonts.sansSemi, fontSize: 13.5, color: colors.white },
  feedHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, marginBottom: 2 },
  feedAsterisk: { marginTop: -8 },
  sep: { height: 1, backgroundColor: colors.border },
  interlude: {
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 30 },
  emptyText: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted },
  link: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.blue },
});
