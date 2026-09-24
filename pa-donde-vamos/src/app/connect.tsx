import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Asterisk, CheersScene } from '@/components/illustrations';
import { FadeIn } from '@/components/onboarding/FadeIn';
import { Screen } from '@/components/Screen';
import { showToast } from '@/components/Toast';
import { AppText, Handwritten } from '@/components/Typography';
import { getFriend } from '@/data/friends';
import { useAppStore } from '@/store/useAppStore';
import { colors, gutter, maxContentWidth } from '@/theme';

const PREVIEW_IDS = ['anasofi', 'luisv', 'sofir'];
const preview = PREVIEW_IDS.map((id) => getFriend(id))
  .filter((f) => f !== undefined)
  .map((f) => ({ name: f.name, avatar: f.avatar }));

export default function ConnectScreen() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, maxContentWidth) - gutter * 2;

  const connect = () => {
    // The auth guard moves us to Home once onboarding is complete.
    completeOnboarding(true);
    showToast('¡Listo! Tus panas ya están conectados', 'users');
  };

  return (
    <Screen contentStyle={styles.content}>
      <FadeIn>
        <AppText variant="h1" accessibilityRole="header" style={styles.title}>
          {'Conecta con\ntus panas'}
        </AppText>
        <AppText variant="body" color={colors.textMuted} style={styles.intro}>
          Invita a tus amigos para ver qué planes tienen, crear juntos y no perderte nada.
        </AppText>
      </FadeIn>

      <FadeIn delay={150} style={styles.art}>
        <CheersScene width={Math.min(contentWidth * 0.94, 330)} />
        <View style={styles.avatars} accessible accessibilityLabel={`${preview.map((p) => p.name).join(', ')} y 12 más`}>
          {preview.map((p) => (
            <Avatar key={p.name} name={p.name} image={p.avatar} size={56} />
          ))}
          <View style={styles.more}>
            <AppText weight="semibold" color={colors.textMuted}>
              +12
            </AppText>
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={300} style={styles.buttons}>
        <Button label="Conectar con contactos" onPress={connect} />
        <Button label="Saltar por ahora" variant="outline" onPress={() => completeOnboarding(false)} />
      </FadeIn>

      <View style={styles.noteArea} accessible accessibilityLabel="Los panas siempre suman">
        <Asterisk width={22} style={styles.starA} />
        <Handwritten rotate={-12} size={26} style={styles.note}>
          {'Los panas\nsiempre\nsuman'}
        </Handwritten>
        <Asterisk width={30} style={styles.starB} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 36 },
  title: { fontSize: 38, lineHeight: 44, letterSpacing: -0.8 },
  intro: { marginTop: 12, maxWidth: 330, lineHeight: 24 },
  art: { alignItems: 'center', marginTop: 24 },
  avatars: { flexDirection: 'row', gap: 6, marginTop: 14 },
  more: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttons: { gap: 12, marginTop: 28 },
  noteArea: { alignSelf: 'flex-end', marginTop: 20, marginRight: 4, paddingLeft: 30, paddingBottom: 16 },
  note: { textAlign: 'left' },
  starA: { position: 'absolute', left: 0, top: 6 },
  starB: { position: 'absolute', right: -8, bottom: -4 },
});
