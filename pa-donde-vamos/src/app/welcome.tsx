import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/Button';
import { WelcomeScene } from '@/components/illustrations';
import { FadeIn } from '@/components/onboarding/FadeIn';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/Typography';
import { colors, fonts, gutter, maxContentWidth } from '@/theme';

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const contentWidth = Math.min(width, maxContentWidth) - gutter * 2;
  // Shrink the art on short phones so the whole screen fits without scrolling.
  const artWidth = Math.max(180, Math.min(contentWidth, (height - 540) / 0.8));
  const titleSize = Math.min(58, contentWidth * 0.165);

  return (
    <Screen
      contentStyle={styles.content}
      footer={
        <FadeIn delay={420} style={styles.buttons}>
          <Button label="Empezar" iconRight="arrow-right" onPress={() => router.push('/signup')} />
          <Button label="Ya tengo cuenta" variant="outline" onPress={() => router.push('/login')} />
        </FadeIn>
      }>
      <FadeIn style={styles.art} offset={10}>
        <WelcomeScene width={artWidth} />
      </FadeIn>

      <FadeIn delay={150}>
        <View accessible accessibilityRole="header" accessibilityLabel="Pa' donde vamos hoy?">
          <AppText style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 0.98 }]}>
            {"PA' DONDE\nVAMOS"}
          </AppText>
          <AppText style={[styles.hoy, { fontSize: titleSize * 1.28, lineHeight: titleSize * 1.36 }]}>HOY?</AppText>
        </View>
      </FadeIn>

      <FadeIn delay={280}>
        <AppText variant="bodyLg" color={colors.inkSoft} style={styles.subtitle}>
          Restaurantes, bares, eventos, cultura y mucho más en Caracas.
        </AppText>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', paddingTop: 12 },
  art: { alignItems: 'center', marginBottom: 20 },
  title: {
    fontFamily: fonts.serifBlack,
    color: colors.ink,
    letterSpacing: -1.5,
    textTransform: 'uppercase',
  },
  hoy: {
    fontFamily: fonts.marker,
    color: colors.blue,
    marginTop: -2,
    marginLeft: 4,
    alignSelf: 'flex-start',
    transform: [{ skewX: '-8deg' }],
  },
  subtitle: { marginTop: 14, maxWidth: 310 },
  buttons: { gap: 12, paddingBottom: 4 },
});
