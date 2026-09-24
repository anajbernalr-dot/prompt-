import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { SearchBar, TextField } from '@/components/Fields';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/Typography';
import { categoryMeta, inferCategory, isPlaceCategory } from '@/components/plan/meta';
import { OptionRow } from '@/components/plan/OptionRow';
import { useDraftGuard } from '@/components/plan/useDraftGuard';
import { composeWhen, initialWhen, WhenPicker } from '@/components/plan/WhenPicker';
import { events, getEvent } from '@/data/events';
import { eventImage, placeImage } from '@/data/images';
import { getPlace, places } from '@/data/places';
import type { PlanCategory, PlanDraft } from '@/data/types';
import { formatDateTime, formatKm } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme';

const hasCategory = (draft: PlanDraft) => !!inferCategory(draft);

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export default function PlanPlaceScreen() {
  const draft = useAppStore((s) => s.draft);
  useDraftGuard(hasCategory, '/plan/new');
  const category = inferCategory(draft);

  if (!category) {
    return (
      <Screen>
        <Header fallback="/plan/new" />
      </Screen>
    );
  }
  return <PlacePicker category={category} initial={draft} />;
}

function PlacePicker({ category, initial }: { category: PlanCategory; initial: PlanDraft }) {
  const setDraft = useAppStore((s) => s.setDraft);
  const meta = categoryMeta(category);
  const [query, setQuery] = useState('');
  const [placeId, setPlaceId] = useState(getPlace(initial.placeId)?.id);
  const [eventId, setEventId] = useState(getEvent(initial.eventId)?.id);
  const [title, setTitle] = useState(initial.title ?? '');
  const [when, setWhen] = useState(() => initialWhen(initial.date));

  const isEvent = category === 'evento';
  const isOther = category === 'otro';
  const valid = isEvent ? !!eventId : isOther ? title.trim().length > 0 : !!placeId;

  const q = normalize(query);
  const pool = [...(isPlaceCategory(category) ? places.filter((p) => p.category === category) : places)].sort(
    (a, b) => a.distanceKm - b.distanceKm,
  );
  let placeList = q
    ? pool.filter((p) => normalize(`${p.name} ${p.zone} ${p.tags.join(' ')}`).includes(q))
    : isOther
      ? pool.slice(0, 4)
      : pool;
  const picked = getPlace(placeId);
  if (!q && picked && !placeList.some((p) => p.id === picked.id)) placeList = [picked, ...placeList];
  const now = Date.now();
  const eventList = events
    .filter((e) => e.id === eventId || new Date(e.date).getTime() > now)
    .sort((a, b) => a.date.localeCompare(b.date));

  const next = () => {
    if (!valid) return;
    if (isEvent) {
      const event = getEvent(eventId);
      setDraft({ category, eventId, placeId: undefined, title: undefined, date: event?.date });
    } else {
      setDraft({
        category,
        placeId,
        eventId: undefined,
        title: isOther ? title.trim() : undefined,
        date: composeWhen(when.day, when.slot),
      });
    }
    router.push('/plan/friends');
  };

  const placeRows = (
    <View style={styles.list}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={isOther ? 'Busca un lugar o una zona…' : `Busca por nombre o zona…`}
      />
      {placeList.map((p) => (
        <OptionRow
          key={p.id}
          image={placeImage(p.image)}
          title={p.name}
          meta={`${isOther ? `${p.categoryLabel} · ` : ''}${p.zone} · ${formatKm(p.distanceKm)}`}
          selected={p.id === placeId}
          onPress={() => setPlaceId(isOther && p.id === placeId ? undefined : p.id)}
        />
      ))}
      {placeList.length === 0 ? (
        <AppText variant="small" align="center" style={styles.empty}>
          {`No encontramos “${query.trim()}”. Prueba con otro nombre o zona.`}
        </AppText>
      ) : null}
    </View>
  );

  return (
    <Screen keyboard footer={<Button label="Siguiente" onPress={next} disabled={!valid} />}>
      <Header title={meta?.question} fallback="/plan/new" />
      <AppText variant="body" color={colors.textMuted} style={styles.hint}>
        {meta?.hint}
      </AppText>

      {isEvent ? (
        <View style={styles.list}>
          {eventList.map((e) => (
            <OptionRow
              key={e.id}
              image={eventImage(e.image)}
              title={e.title}
              meta={formatDateTime(e.date)}
              detail={`${e.venue} · ${formatKm(e.distanceKm)}`}
              selected={e.id === eventId}
              onPress={() => setEventId(e.id)}
            />
          ))}
        </View>
      ) : null}

      {isOther ? (
        <>
          <TextField
            label="¿Qué plan tienes en mente?"
            placeholder="Ej: cumple de Luis, playa en La Guaira…"
            value={title}
            onChangeText={setTitle}
            maxLength={60}
            returnKeyType="done"
            autoCapitalize="sentences"
          />
          <View style={styles.sectionHead}>
            <AppText variant="h3">¿Dónde?</AppText>
            <AppText variant="small">Opcional</AppText>
          </View>
          {placeRows}
        </>
      ) : null}

      {isPlaceCategory(category) ? placeRows : null}

      {!isEvent ? (
        <View style={styles.when}>
          <WhenPicker day={when.day} slot={when.slot} onChange={setWhen} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { marginBottom: 18 },
  list: { gap: 10 },
  empty: { paddingVertical: 18 },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 26, marginBottom: 12 },
  when: { marginTop: 28 },
});
