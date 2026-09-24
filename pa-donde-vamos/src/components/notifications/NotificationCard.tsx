import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { FilledIcon, Icon, type IconName } from '@/components/Icon';
import { Card } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import { getFriend } from '@/data/friends';
import type { AppNotification, NotificationKind } from '@/data/types';
import { formatTimeAgo } from '@/lib/format';
import { colors, fonts } from '@/theme';

const systemIcons: Partial<Record<NotificationKind, IconName>> = {
  follow: 'user',
  reminder: 'clock',
  plan: 'calendar',
  invite: 'mail',
  comment: 'message-circle',
  wants: 'heart',
};

/** Splits `text` into plain and bold runs using the notification's boldParts. */
export function splitBold(text: string, bold: string[] = []): { text: string; bold: boolean }[] {
  const parts = bold.filter(Boolean);
  if (parts.length === 0) return [{ text, bold: false }];
  const escaped = parts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'g');
  return text
    .split(re)
    .filter((t) => t.length > 0)
    .map((t) => ({ text: t, bold: parts.includes(t) }));
}

function Leading({ n }: { n: AppNotification }) {
  const friend = n.kind !== 'follow' ? getFriend(n.friendId) : undefined;
  if (friend) return <Avatar name={friend.name} image={friend.avatar} size={48} />;
  return (
    <View style={styles.system}>
      {n.kind === 'tickets' ? (
        <FilledIcon name="ticket-outline" size={21} color={colors.white} />
      ) : (
        <Icon name={systemIcons[n.kind] ?? 'bell'} size={20} color={colors.white} />
      )}
    </View>
  );
}

export function NotificationCard({ n, onPress }: { n: AppNotification; onPress: () => void }) {
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${n.read ? '' : 'Nueva. '}${n.text}. ${formatTimeAgo(n.at)}`}
      style={[styles.card, !n.read && styles.unread]}>
      <Leading n={n} />
      <View style={styles.body}>
        <Text style={styles.text}>
          {splitBold(n.text, n.boldParts).map((run, i) => (
            <Text key={i} style={run.bold ? styles.bold : null}>
              {run.text}
            </Text>
          ))}
        </Text>
        <AppText variant="small" color={colors.textFaint} style={styles.time}>
          {formatTimeAgo(n.at)}
        </AppText>
      </View>
      <View style={styles.right}>
        {!n.read ? <View style={styles.dot} accessibilityLabel="Sin leer" /> : null}
        <Icon name="chevron-right" size={20} color={colors.textMuted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 14 },
  unread: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
  system: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  text: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 21, color: colors.inkSoft },
  bold: { fontFamily: fonts.sansSemi, color: colors.ink },
  time: { marginTop: 6 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue },
});
