import { Pressable, StyleSheet, View } from 'react-native';

import { FilledIcon, Icon } from '@/components/Icon';
import { Card, Photo } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import { getFriend } from '@/data/friends';
import { formatDateTime } from '@/lib/format';
import { colors } from '@/theme';

import { describeTarget } from './meta';

/** "Con: Ana Sofi +2" / "Solo tú" */
export function withWhoLabel(friendIds: string[]) {
  const names = friendIds.map((id) => getFriend(id)?.name).filter(Boolean) as string[];
  if (!names.length) return 'Solo tú';
  return `Con: ${names[0]}${names.length > 1 ? ` +${names.length - 1}` : ''}`;
}

/** Plan summary on "Revisemos tu plan": photo, name, date (tap to change) and who's going. */
export function PlanSummaryCard({
  target,
  date,
  friendIds,
  onChangeDate,
  onChangeFriends,
}: {
  target: { placeId?: string; eventId?: string; title?: string };
  date?: string;
  friendIds: string[];
  onChangeDate: () => void;
  onChangeFriends: () => void;
}) {
  const t = describeTarget(target);
  // Custom "Otro" plans show where they happen under their own title.
  const location = t.place && target.title?.trim() ? t.place.name : undefined;
  return (
    <Card style={styles.card}>
      {t.image ? (
        <Photo source={t.image} rounded={14} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbEmpty]}>
          <FilledIcon name="sparkles-outline" size={30} color={colors.blue} />
        </View>
      )}
      <View style={styles.info}>
        <AppText variant="title" numberOfLines={2} style={styles.name}>
          {t.name}
        </AppText>
        {location ? (
          <AppText variant="caption" numberOfLines={1} style={styles.location}>
            {location}
          </AppText>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Fecha: ${date ? formatDateTime(date) : 'sin fecha'}. Toca para cambiarla`}
          onPress={onChangeDate}
          hitSlop={6}
          style={({ pressed }) => [styles.line, pressed && { opacity: 0.6 }]}>
          <AppText variant="small" numberOfLines={1} style={styles.flex}>
            {date ? formatDateTime(date) : 'Elige una fecha'}
          </AppText>
          <Icon name="edit-2" size={12} color={colors.textFaint} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${withWhoLabel(friendIds)}. Toca para cambiar`}
          onPress={onChangeFriends}
          hitSlop={6}
          style={({ pressed }) => [styles.line, pressed && { opacity: 0.6 }]}>
          <AppText variant="small" numberOfLines={1} style={styles.flex}>
            {withWhoLabel(friendIds)}
          </AppText>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 8, paddingRight: 14 },
  thumb: { width: 116, height: 124, borderRadius: 14 },
  thumbEmpty: { backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 6, paddingVertical: 8 },
  name: { fontSize: 16.5, lineHeight: 22, marginBottom: 4 },
  location: { marginTop: -8, marginBottom: 2 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 26 },
  flex: { flexShrink: 1 },
});
