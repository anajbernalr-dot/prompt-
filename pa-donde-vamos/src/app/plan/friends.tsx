import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Fields';
import { Header } from '@/components/Header';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { AppText, Handwritten, Title } from '@/components/Typography';
import { Asterisk } from '@/components/illustrations';
import { draftHasTarget } from '@/components/plan/meta';
import { useDraftGuard } from '@/components/plan/useDraftGuard';
import { getFriend } from '@/data/friends';
import type { Friend } from '@/data/types';
import { tap } from '@/lib/actions';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius } from '@/theme';

export default function PlanFriendsScreen() {
  useDraftGuard(draftHasTarget, '/plan/new');
  const friendIds = useAppStore((s) => s.friendIds);
  const draftFriendIds = useAppStore((s) => s.draft.friendIds);
  const setDraft = useAppStore((s) => s.setDraft);
  const [selected, setSelected] = useState<string[]>(() => draftFriendIds ?? []);

  const people = friendIds.map((id) => getFriend(id)).filter((f): f is Friend => !!f);

  const toggle = (id: string) => {
    tap();
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const next = () => {
    // Keep the order of the list, drop friends that are no longer connected.
    setDraft({ friendIds: friendIds.filter((id) => selected.includes(id)) });
    router.push('/plan/review');
  };

  const count = selected.filter((id) => friendIds.includes(id)).length;

  return (
    <Screen
      footer={
        <Button
          label={count ? 'Continuar' : 'Ir solo'}
          accessibilityLabel={count ? `Continuar con ${count} ${count === 1 ? 'pana' : 'panas'}` : 'Ir solo'}
          onPress={next}
        />
      }>
      <Header fallback="/plan/place" />
      <Title style={styles.title}>¿Con quién vas?</Title>
      <AppText variant="bodyLg" color={colors.textMuted} style={styles.body}>
        Elige con quién te gustaría ir o crea un plan solo.
      </AppText>

      {people.length ? (
        <View style={styles.group}>
          {people.map((f, i) => {
            const checked = selected.includes(f.id);
            return (
              <Pressable
                key={f.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                aria-checked={checked}
                accessibilityLabel={`${f.name}, @${f.handle}`}
                onPress={() => toggle(f.id)}
                style={({ pressed }) => [
                  styles.row,
                  i < people.length - 1 && styles.divider,
                  pressed && { backgroundColor: colors.surfaceMuted },
                ]}>
                <Avatar name={f.name} image={f.avatar} size={56} />
                <View style={styles.names}>
                  <AppText variant="title" numberOfLines={1}>
                    {f.name}
                  </AppText>
                  <AppText variant="small" color={colors.textFaint} numberOfLines={1}>
                    @{f.handle}
                  </AppText>
                </View>
                <Checkbox checked={checked} size={26} />
              </Pressable>
            );
          })}
        </View>
      ) : (
        <AppText variant="body" color={colors.textMuted} style={styles.none}>
          Todavía no tienes panas conectados. Agrégalos y armen el plan juntos.
        </AppText>
      )}

      <View style={styles.addWrap}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Agregar amigos"
          onPress={() => router.push('/friends')}
          style={({ pressed }) => [styles.addRow, pressed && { opacity: 0.6 }]}>
          <View style={styles.addCircle}>
            <Icon name="plus" size={22} color={colors.ink} />
          </View>
          <AppText variant="bodyLg">Agregar amigos</AppText>
        </Pressable>
        <View style={styles.doodle} pointerEvents="none">
          <Handwritten rotate={-10} size={19} style={styles.note}>
            {'Pana\n  seguro'}
          </Handwritten>
          <Asterisk width={16} style={styles.star} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 10, fontSize: 34, lineHeight: 40 },
  body: { marginTop: 10, marginBottom: 22, maxWidth: 290 },
  group: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14, paddingHorizontal: 14 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderStrong },
  names: { flex: 1, gap: 3 },
  none: { marginBottom: 8 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12, paddingHorizontal: 14 },
  addCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addWrap: { minHeight: 120 },
  doodle: { position: 'absolute', right: 4, top: 52, width: 120, height: 62 },
  note: { position: 'absolute', right: 14, top: 0, lineHeight: 21 },
  star: { position: 'absolute', right: 0, top: 40 },
});
