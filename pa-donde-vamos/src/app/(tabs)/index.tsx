import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/Button';
import { ChipRow } from '@/components/Chip';
import { SearchBar } from '@/components/Fields';
import { FeaturedCard } from '@/components/home/FeaturedCard';
import { PlanCta } from '@/components/home/PlanCta';
import { PlanRow } from '@/components/home/PlanRow';
import { SpotCard } from '@/components/home/SpotCard';
import { eventsByDate, FILTER_CATEGORY, FILTERS, featuredFor, nearbyFor, type FilterKey } from '@/components/home/spots';
import { WeekEventCard } from '@/components/home/WeekEventCard';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { Card, SectionTitle } from '@/components/Surfaces';
import { AppText, Title } from '@/components/Typography';
import { getEvent } from '@/data/events';
import { getPlace } from '@/data/places';
import { firstName } from '@/lib/format';
import { selectUnreadCount, sortPlans, useAppStore } from '@/store/useAppStore';
import { colors, fonts, gutter } from '@/theme';

const WEEK_MS = 7 * 86_400_000;

export default function HomeScreen() {
  const userName = useAppStore((s) => s.user?.name ?? '');
  const unread = useAppStore(selectUnreadCount);
  const plans = useAppStore((s) => s.plans);
  const [filter, setFilter] = useState<FilterKey>('todo');
  const [now] = useState(() => Date.now());

  const featured = useMemo(() => featuredFor(filter), [filter]);
  const nearby = useMemo(() => nearbyFor(filter, featured?.id), [filter, featured]);

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

  const weekEvents = useMemo(
    () => eventsByDate().filter((e) => new Date(e.date).getTime() - now < WEEK_MS),
    [now],
  );
  const showWeekEvents = filter === 'todo' && weekEvents.length > 0;
  const hello = firstName(userName);

  return (
    <Screen safeBottom={false} contentStyle={styles.content}>
      <View style={styles.helloRow}>
        <AppText style={styles.hello} numberOfLines={1}>
          {hello ? `Hola, ${hello}` : 'Hola'}
        </AppText>
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

      {featured ? <FeaturedCard key={featured.id} spot={featured} /> : null}

      {nearby.length ? (
        <View style={styles.section}>
          <SectionTitle right={<LinkText label="Ver mapa" onPress={() => router.push('/map')} />}>
            Cerca de ti
          </SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bleed}
            contentContainerStyle={styles.rail}>
            {nearby.map((s) => (
              <SpotCard key={s.id} spot={s} />
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

      <View style={styles.section}>
        <PlanCta />
      </View>

      {showWeekEvents ? (
        <View style={styles.section}>
          <SectionTitle
            right={<LinkText label="Ver todos" onPress={() => router.push('/explore?cat=eventos')} />}>
            Eventos esta semana
          </SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bleed}
            contentContainerStyle={styles.rail}>
            {weekEvents.map((e) => (
              <WeekEventCard key={e.id} event={e} />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </Screen>
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
  link: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.blue },
});
