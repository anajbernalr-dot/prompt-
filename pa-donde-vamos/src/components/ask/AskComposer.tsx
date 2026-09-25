import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { AppText } from '@/components/Typography';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius } from '@/theme';

/** Feed card that opens "Crear recomendación". */
export function AskComposer() {
  const user = useAppStore((s) => s.user);
  return (
    <Pressable
      onPress={() => router.push('/ask')}
      accessibilityRole="button"
      accessibilityLabel="Pídele una recomendación a tus panas"
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <Avatar name={user?.name ?? 'Tú'} image={user?.avatar ?? null} size={44} />
      <AppText style={styles.text} numberOfLines={2}>
        Pídele una recomendación a tus panas…
      </AppText>
      <View style={styles.arrow}>
        <View style={[styles.tick, { transform: [{ rotate: '-35deg' }], top: -2, right: 30 }]} />
        <View style={[styles.tick, { transform: [{ rotate: '-70deg' }], top: 2, right: 18 }]} />
        <Icon name="arrow-right" size={26} color={colors.blue} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.blueSoft,
    marginBottom: 6,
  },
  text: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 15.5, lineHeight: 21, color: colors.blueInk },
  arrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2 },
  tick: { position: 'absolute', width: 2.5, height: 9, borderRadius: 2, backgroundColor: colors.blue },
});
