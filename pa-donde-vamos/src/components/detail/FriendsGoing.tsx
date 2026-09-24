import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AvatarStack } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { Card, SectionTitle } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import { getFriend } from '@/data/friends';
import type { Friend } from '@/data/types';
import { formatRelativeDay, formatTime } from '@/lib/format';
import { sortPlans, useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme';

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length > 3) return `${names.slice(0, 2).join(', ')} y ${names.length - 2} más`;
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
}

/** "Panas que quieren ir" — friends that already have a plan with you at this place. Hidden if none. */
export function FriendsGoing({ placeId }: { placeId: string }) {
  const plans = useAppStore((s) => s.plans);
  const here = useMemo(() => sortPlans(plans.filter((p) => p.placeId === placeId)), [plans, placeId]);
  const people = useMemo(() => {
    const ids = [...new Set(here.flatMap((p) => p.friendIds))];
    return ids.map((id) => getFriend(id)).filter((f): f is Friend => !!f);
  }, [here]);

  const next = here[0];
  if (!next || people.length === 0) return null;

  const names = joinNames(people.map((f) => f.name));
  const when = `${formatRelativeDay(next.date)} · ${formatTime(next.date)}`;

  return (
    <View style={styles.section}>
      <SectionTitle>Panas que quieren ir</SectionTitle>
      <Card
        onPress={() => router.push(`/plans/${next.id}`)}
        accessibilityLabel={`${names}. Ver plan del ${when}`}
        style={styles.card}>
        <AvatarStack people={people.map((f) => ({ name: f.name, avatar: f.avatar }))} size={34} max={3} />
        <View style={styles.text}>
          <AppText variant="title" numberOfLines={1} style={styles.names}>
            {names}
          </AppText>
          <AppText variant="small" numberOfLines={1}>
            {here.length > 1 ? `${here.length} planes · ${when}` : when}
          </AppText>
        </View>
        <Icon name="chevron-right" size={18} color={colors.textFaint} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 26 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  text: { flex: 1, gap: 2 },
  names: { fontSize: 15 },
});
