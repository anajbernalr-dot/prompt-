import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AvatarStack } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import { getEvent } from '@/data/events';
import { getFriend } from '@/data/friends';
import { eventImage, placeImage } from '@/data/images';
import { getPlace } from '@/data/places';
import type { Plan } from '@/data/types';
import { formatDateTime } from '@/lib/format';
import { planTitle, sortPlans, useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme';

import { Badge, SavedRow } from './SavedRow';

function EmptyAction({ label, onPress }: { label: string; onPress: () => void }) {
  return <Button label={label} size="sm" fullWidth={false} onPress={onPress} style={styles.emptyAction} />;
}

export function SavedPlacesList() {
  const savedPlaces = useAppStore((s) => s.savedPlaces);
  const items = useMemo(() => savedPlaces.map((id) => getPlace(id)).filter((p) => !!p), [savedPlaces]);

  if (items.length === 0) {
    return (
      <EmptyState
        icon="heart"
        title="Aún no guardas lugares"
        body="Toca el corazón en cualquier lugar para tenerlo siempre a mano."
        action={<EmptyAction label="Explorar" onPress={() => router.navigate('/explore')} />}
      />
    );
  }

  return (
    <View style={styles.list}>
      {items.map((p) => (
        <SavedRow
          key={p.id}
          image={placeImage(p.image)}
          title={p.name}
          meta={`${p.categoryLabel} · ${p.zone}`}
          onPress={() => router.push(`/place/${p.id}`)}
        />
      ))}
    </View>
  );
}

export function SavedEventsList() {
  const savedEvents = useAppStore((s) => s.savedEvents);
  const tickets = useAppStore((s) => s.tickets);
  const items = useMemo(() => savedEvents.map((id) => getEvent(id)).filter((e) => !!e), [savedEvents]);
  const ticketCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tickets) counts[t.eventId] = (counts[t.eventId] ?? 0) + t.qty;
    return counts;
  }, [tickets]);

  if (items.length === 0) {
    return (
      <EmptyState
        icon="bookmark"
        title="No tienes eventos guardados"
        body="Descubre lo que está pasando en Caracas esta semana."
        action={<EmptyAction label="Explorar eventos" onPress={() => router.navigate('/explore?cat=eventos')} />}
      />
    );
  }

  return (
    <View style={styles.list}>
      {items.map((e) => {
        const qty = ticketCount[e.id] ?? 0;
        return (
          <SavedRow
            key={e.id}
            image={eventImage(e.image)}
            title={e.title}
            meta={formatDateTime(e.date)}
            extra={
              qty > 0 ? (
                <Badge label={`🎟️ ${qty} ${qty === 1 ? 'entrada' : 'entradas'}`} />
              ) : (
                <AppText variant="small" color={colors.textFaint} numberOfLines={1}>
                  {e.venue}
                </AppText>
              )
            }
            onPress={() => router.push(`/event/${e.id}`)}
          />
        );
      })}
      <Button
        label="Descubrir más eventos"
        variant="outline"
        size="md"
        iconRight="arrow-right"
        onPress={() => router.navigate('/explore?cat=eventos')}
        style={styles.more}
      />
    </View>
  );
}

function PlanRow({ plan, past }: { plan: Plan; past?: boolean }) {
  const place = getPlace(plan.placeId);
  const event = getEvent(plan.eventId);
  const image = place ? placeImage(place.image) : event ? eventImage(event.image) : undefined;
  const people = plan.friendIds
    .map((id) => getFriend(id))
    .filter((f) => !!f)
    .map((f) => ({ name: f.name, avatar: f.avatar }));

  return (
    <SavedRow
      image={image}
      title={planTitle(plan)}
      meta={formatDateTime(plan.date)}
      dimmed={past}
      extra={
        people.length > 0 ? (
          <AvatarStack people={people} size={24} max={4} style={styles.stack} />
        ) : (
          <AppText variant="caption" style={styles.solo}>
            Solo tú
          </AppText>
        )
      }
      onPress={() => router.push(`/plans/${plan.id}`)}
    />
  );
}

export function SavedPlansList() {
  const plans = useAppStore((s) => s.plans);
  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const sorted = sortPlans(plans);
    return {
      upcoming: sorted.filter((p) => new Date(p.date).getTime() >= now),
      past: sorted.filter((p) => new Date(p.date).getTime() < now).reverse(),
    };
  }, [plans]);

  if (plans.length === 0) {
    return (
      <EmptyState
        icon="calendar"
        title="Todavía no hay planes"
        body="Arma uno con tus panas en segundos."
        action={<EmptyAction label="Crear plan" onPress={() => router.push('/plan/new')} />}
      />
    );
  }

  return (
    <View>
      <View style={styles.plansHeader}>
        <AppText variant="small" color={colors.textFaint}>
          {upcoming.length === 1 ? '1 plan próximo' : `${upcoming.length} planes próximos`}
        </AppText>
        <Button
          label="Crear plan"
          iconLeft="plus"
          size="sm"
          fullWidth={false}
          onPress={() => router.push('/plan/new')}
        />
      </View>

      {upcoming.length > 0 ? (
        <View style={styles.list}>
          {upcoming.map((p) => (
            <PlanRow key={p.id} plan={p} />
          ))}
        </View>
      ) : (
        <AppText variant="body" color={colors.textMuted} style={styles.noUpcoming}>
          No tienes planes próximos. ¿Armamos uno?
        </AppText>
      )}

      {past.length > 0 ? (
        <View style={styles.pastSection}>
          <AppText variant="title" style={styles.sectionTitle}>
            Pasados
          </AppText>
          <View style={styles.list}>
            {past.map((p) => (
              <PlanRow key={p.id} plan={p} past />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  emptyAction: { marginTop: 8, alignSelf: 'center' },
  more: { marginTop: 8 },
  plansHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stack: { marginTop: 4 },
  solo: { marginTop: 3 },
  noUpcoming: { paddingVertical: 12 },
  pastSection: { marginTop: 26 },
  sectionTitle: { fontSize: 17, marginBottom: 10 },
});
