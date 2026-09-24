import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FriendCard } from '@/components/friends/FriendCard';
import { SuggestedFriends } from '@/components/friends/SuggestedFriends';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/Surfaces';
import { showToast } from '@/components/Toast';
import { Title } from '@/components/Typography';
import { friends, getFriend } from '@/data/friends';
import { shareText } from '@/lib/actions';
import { planWithFriend, useAppStore } from '@/store/useAppStore';

const INVITE_MESSAGE = "¡Vente a Pa' Donde Vamos Hoy? Descubre planes en Caracas con tus panas 🙌";

async function invite() {
  await shareText(INVITE_MESSAGE);
  showToast('Invitación lista para compartir', 'send');
}

export default function FriendsScreen() {
  const friendIds = useAppStore((s) => s.friendIds);
  const plans = useAppStore((s) => s.plans);

  const connected = useMemo(() => {
    const now = Date.now();
    const upcoming = plans.filter((p) => new Date(p.date).getTime() >= now);
    return friendIds
      .map((id, order) => {
        const friend = getFriend(id);
        return friend ? { friend, plan: planWithFriend(upcoming, id), order } : null;
      })
      .filter((row) => !!row)
      .sort((a, b) => {
        if (a.plan && b.plan) return a.plan.date.localeCompare(b.plan.date) || a.order - b.order;
        if (a.plan) return -1;
        if (b.plan) return 1;
        return a.order - b.order;
      });
  }, [friendIds, plans]);

  const suggested = useMemo(() => friends.filter((f) => !friendIds.includes(f.id)), [friendIds]);

  return (
    <Screen safeBottom={false}>
      <View style={styles.header}>
        <Title>Amigos</Title>
        <Button label="Invitar" iconLeft="plus" size="md" fullWidth={false} onPress={invite} style={styles.invite} />
      </View>

      {connected.length === 0 ? (
        <EmptyState
          icon="users"
          title="Aún no tienes panas"
          body="Invita a tus amigos o agrega a alguno de los sugeridos."
        />
      ) : (
        <View style={styles.list}>
          {connected.map(({ friend, plan }, i) => (
            <FriendCard key={friend.id} friend={friend} plan={plan} highlight={i === 0} />
          ))}
        </View>
      )}

      <SuggestedFriends people={suggested} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 20,
  },
  invite: { paddingHorizontal: 20 },
  list: { gap: 12 },
});
