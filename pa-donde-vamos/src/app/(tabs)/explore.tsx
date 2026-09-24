import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, IconButton } from '@/components/Button';
import { ChipRow } from '@/components/Chip';
import { InspireCard } from '@/components/explore/InspireCard';
import { EventResultRow, PlaceResultRow } from '@/components/explore/ResultRows';
import {
  exploreCats,
  matches,
  normalize,
  parseExploreCat,
  placeCategoryFor,
  plural,
  type ExploreCat,
} from '@/components/explore/search';
import { SearchBar } from '@/components/Fields';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/Surfaces';
import { AppText, Title } from '@/components/Typography';
import { events } from '@/data/events';
import { places } from '@/data/places';
import { colors } from '@/theme';

type Params = { q?: string; focus?: string; cat?: string };

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

export default function ExploreScreen() {
  const raw = useLocalSearchParams<Params>();
  const params = { q: first(raw.q), focus: first(raw.focus), cat: first(raw.cat) };

  const [query, setQuery] = useState(params.q ?? '');
  const [cat, setCat] = useState<ExploreCat>(parseExploreCat(params.cat));
  const [focusKey, setFocusKey] = useState(0);
  const [seen, setSeen] = useState(params);

  // The tab stays mounted: pick up new ?q / ?cat / ?focus coming from other screens.
  if (seen.q !== params.q || seen.cat !== params.cat || seen.focus !== params.focus) {
    if (seen.q !== params.q) setQuery(params.q ?? '');
    if (seen.cat !== params.cat) setCat(parseExploreCat(params.cat));
    if (params.focus === '1' && seen.focus !== '1') setFocusKey((k) => k + 1);
    setSeen(params);
  }

  // Consume ?focus=1 so the next "search" tap from Inicio focuses the input again.
  useEffect(() => {
    if (params.focus === '1') router.setParams({ focus: undefined });
  }, [params.focus]);

  const onCat = (key: ExploreCat) => {
    setCat(key);
    router.setParams({ cat: key });
  };

  const q = normalize(query);

  const placeResults = useMemo(() => {
    if (cat === 'eventos') return [];
    const wanted = placeCategoryFor[cat];
    return places
      .filter((p) => (!wanted || p.category === wanted) && matches(q, [p.name, p.zone, p.categoryLabel, ...p.tags]))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [cat, q]);

  const eventResults = useMemo(() => {
    if (cat !== 'todo' && cat !== 'eventos') return [];
    return events
      .filter((e) => matches(q, [e.title, e.zone, e.venue, e.category]))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [cat, q]);

  const total = placeResults.length + eventResults.length;
  const countLabel = [
    cat !== 'eventos' ? plural(placeResults.length, 'lugar', 'lugares') : null,
    cat === 'todo' || cat === 'eventos' ? plural(eventResults.length, 'evento', 'eventos') : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Screen safeBottom={false}>
      <View style={styles.header}>
        <Title>Explorar</Title>
        <IconButton
          icon="map"
          iconSize={20}
          size={44}
          color={colors.ink}
          background={colors.surfaceMuted}
          accessibilityLabel="Ver en el mapa"
          onPress={() => router.navigate('/map')}
        />
      </View>

      <SearchBar
        key={focusKey}
        value={query}
        onChangeText={setQuery}
        autoFocus={params.focus === '1' || focusKey > 0}
        placeholder="Busca un lugar, zona o antojo…"
        style={styles.search}
      />

      <ChipRow options={exploreCats} value={cat} onChange={onCat} style={styles.chips} />

      {total > 0 ? (
        <AppText variant="small" color={colors.textFaint} style={styles.count}>
          {countLabel}
        </AppText>
      ) : null}

      {total === 0 ? (
        <EmptyState
          icon="search"
          title="Nada por aquí"
          body="Prueba con otra búsqueda"
          action={
            <Button
              label="Ver todo"
              variant="outline"
              size="sm"
              fullWidth={false}
              style={styles.emptyAction}
              onPress={() => {
                setQuery('');
                onCat('todo');
              }}
            />
          }
        />
      ) : null}

      {placeResults.map((p, i) => (
        <PlaceResultRow key={p.id} place={p} last={i === placeResults.length - 1} />
      ))}

      {eventResults.length > 0 ? (
        <View style={cat === 'todo' && placeResults.length > 0 ? styles.eventsSection : null}>
          {cat === 'todo' && placeResults.length > 0 ? (
            <AppText variant="title" style={styles.sectionTitle}>
              Eventos
            </AppText>
          ) : null}
          {eventResults.map((e, i) => (
            <EventResultRow key={e.id} event={e} last={i === eventResults.length - 1} />
          ))}
        </View>
      ) : null}

      <InspireCard />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  search: { marginTop: 18 },
  chips: { marginTop: 14 },
  count: { marginTop: 16, marginBottom: 2 },
  emptyAction: { marginTop: 8, alignSelf: 'center' },
  eventsSection: { marginTop: 22 },
  sectionTitle: { fontSize: 17, marginBottom: 2 },
});
