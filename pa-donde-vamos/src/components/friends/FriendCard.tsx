import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { Card } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import type { Friend, Plan } from '@/data/types';
import { formatTime } from '@/lib/format';
import { planTitle } from '@/store/useAppStore';
import { colors, fonts, radius } from '@/theme';

/** Connected friend with the soonest plan you share. Opens the chat. */
export function FriendCard({ friend, plan, highlight }: { friend: Friend; plan?: Plan; highlight?: boolean }) {
  const planLine = plan ? `${planTitle(plan)} · ${formatTime(plan.date)}` : null;
  return (
    <Card
      onPress={() => router.push(`/chat/${friend.id}`)}
      accessibilityLabel={`Ver chat con ${friend.name}${planLine ? `. Plan: ${planLine}` : ''}`}
      style={styles.card}>
      <Avatar name={friend.name} image={friend.avatar} size={56} online={friend.online} />
      <View style={styles.body}>
        <AppText variant="title" numberOfLines={1} style={styles.name}>
          {friend.name}
        </AppText>
        <AppText variant="small" color={colors.textFaint} numberOfLines={1} style={styles.handle}>
          @{friend.handle}
        </AppText>
        <View style={styles.planBlock}>
          {plan && highlight ? (
            <AppText variant="label" weight="semibold" color={colors.blue}>
              Plan en común
            </AppText>
          ) : null}
          <AppText
            variant="small"
            numberOfLines={1}
            color={plan ? colors.inkSoft : colors.textFaint}
            style={styles.planLine}>
            {planLine ?? 'Sin planes todavía'}
          </AppText>
        </View>
      </View>
      <View style={styles.right}>
        <View style={styles.ver}>
          <AppText style={styles.verText}>Ver</AppText>
        </View>
        <Icon name="chevron-right" size={20} color={colors.textMuted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 14, borderRadius: 22 },
  body: { flex: 1, paddingTop: 2 },
  name: { fontSize: 17.5, lineHeight: 23, paddingRight: 72 },
  handle: { paddingRight: 72 },
  planBlock: { marginTop: 12, gap: 3 },
  planLine: { fontSize: 13.5 },
  // Floats over the card so the plan line can use the full width underneath.
  right: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ver: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  verText: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 17, color: colors.text },
});
