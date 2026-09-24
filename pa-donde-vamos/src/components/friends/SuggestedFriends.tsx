import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Surfaces';
import { showToast } from '@/components/Toast';
import { AppText, Handwritten } from '@/components/Typography';
import type { Friend } from '@/data/types';
import { success } from '@/lib/actions';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme';

/** "Sugeridos para ti": people from the app you haven't connected with yet. */
export function SuggestedFriends({ people }: { people: Friend[] }) {
  const addFriend = useAppStore((s) => s.addFriend);
  if (people.length === 0) return null;

  const onAdd = (f: Friend) => {
    success();
    addFriend(f.id);
    showToast(`¡${f.name} ahora es tu pana!`, 'user-check');
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="title" style={styles.heading}>
          Sugeridos para ti
        </AppText>
        <Handwritten rotate={-5} size={17}>
          ¡Mientras más, mejor!
        </Handwritten>
      </View>
      <Card style={styles.card}>
        {people.map((f, i) => (
          <View key={f.id} style={[styles.row, i < people.length - 1 && styles.divider]}>
            <Avatar name={f.name} image={f.avatar} size={46} online={f.online} />
            <View style={styles.body}>
              <AppText variant="title" numberOfLines={1}>
                {f.name}
              </AppText>
              <AppText variant="small" color={colors.textFaint} numberOfLines={1}>
                @{f.handle}
              </AppText>
            </View>
            <Button
              label="Agregar"
              iconLeft="user-plus"
              variant="outline"
              size="sm"
              fullWidth={false}
              accessibilityLabel={`Agregar a ${f.name}`}
              onPress={() => onAdd(f)}
            />
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 30 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heading: { fontSize: 17 },
  card: { paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderStrong },
  body: { flex: 1 },
});
