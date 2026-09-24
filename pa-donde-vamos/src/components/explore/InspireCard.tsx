import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Burst } from '@/components/illustrations';
import { AppText, Handwritten } from '@/components/Typography';
import { colors, radius } from '@/theme';

/** Footer link to /inspiration with a hand-written note. */
export function InspireCard() {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel="¿No sabes qué hacer? Déjate inspirar"
      onPress={() => router.push('/inspiration')}
      style={({ pressed }) => [styles.card, pressed && { backgroundColor: colors.surfaceMuted }]}>
      <View style={styles.text}>
        <Handwritten rotate={-4} size={21} style={styles.note}>
          ¿No sabes qué hacer?
        </Handwritten>
        <View style={styles.titleRow}>
          <AppText variant="h3">Déjate inspirar</AppText>
          <Icon name="arrow-right" size={20} color={colors.ink} />
        </View>
        <AppText variant="small">Ideas de planes distintos por Caracas.</AppText>
      </View>
      <Burst width={58} color={colors.blue} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 28,
    padding: 18,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  text: { flex: 1, gap: 4 },
  note: { alignSelf: 'flex-start', marginBottom: 4, marginLeft: -2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
