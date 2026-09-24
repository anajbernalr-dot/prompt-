import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Asterisk, PalmSunScene } from '@/components/illustrations';
import { Screen } from '@/components/Screen';
import { Handwritten } from '@/components/Typography';

const LINES: { text: string; indent: number }[] = [
  { text: 'Caracas', indent: 0 },
  { text: 'Siempre', indent: 14 },
  { text: 'es una', indent: 6 },
  { text: 'buena', indent: 30 },
  { text: 'idea', indent: 60 },
];

export default function InspirationScreen() {
  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [appear]);

  return (
    <Screen
      contentStyle={styles.content}
      footer={
        <>
          <Button label="Ver más planes" onPress={() => router.replace('/explore')} />
          <Button label="Ir al inicio" variant="outline" onPress={() => router.replace('/')} />
        </>
      }>
      <Animated.View
        style={{
          opacity: appear,
          transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        }}>
        <PalmSunScene width={300} style={styles.scene} />
      </Animated.View>

      <View style={styles.block} accessible accessibilityLabel="Caracas siempre es una buena idea">
        <View style={styles.lines}>
          {LINES.map((l) => (
            <Handwritten key={l.text} size={50} rotate={-6} style={[styles.line, { marginLeft: l.indent }]}>
              {l.text}
            </Handwritten>
          ))}
        </View>
        <Asterisk width={34} style={styles.astRight} />
        <Asterisk width={26} style={styles.astLeft} />
        <Asterisk width={40} style={styles.astBottom} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', justifyContent: 'center', paddingTop: 24 },
  scene: { alignSelf: 'center' },
  block: { width: 300, marginTop: 8, paddingBottom: 8 },
  lines: { paddingLeft: 30 },
  line: { letterSpacing: 2, lineHeight: 54 },
  astRight: { position: 'absolute', right: 0, top: 98 },
  astLeft: { position: 'absolute', left: 4, bottom: 18 },
  astBottom: { position: 'absolute', right: 8, bottom: 6 },
});
