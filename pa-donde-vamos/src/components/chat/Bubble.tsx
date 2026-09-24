import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { AppText } from '@/components/Typography';
import type { ChatMessage } from '@/data/types';
import { formatTime } from '@/lib/format';
import { colors, fonts } from '@/theme';

/** One chat message. Incoming: cream bubble with the time inside; outgoing: blue bubble, time underneath. */
export function Bubble({ message }: { message: ChatMessage }) {
  const mine = message.from === 'me';
  if (mine) {
    return (
      <View style={[styles.wrap, styles.right]}>
        <View style={[styles.bubble, styles.out]}>
          <AppText style={[styles.text, { color: colors.white }]}>{message.text}</AppText>
        </View>
        <View style={styles.metaOut}>
          <AppText variant="caption" style={styles.time}>
            {formatTime(message.at)}
          </AppText>
          <Icon name="check" size={12} color={colors.textFaint} />
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.wrap, styles.left]}>
      <View style={[styles.bubble, styles.in]}>
        <AppText style={styles.text}>{message.text}</AppText>
        <AppText variant="caption" style={[styles.time, { marginTop: 6 }]}>
          {formatTime(message.at)}
        </AppText>
      </View>
    </View>
  );
}

/** "escribiendo…" bubble with three pulsing dots. */
export function TypingBubble({ name }: { name: string }) {
  const dots = useRef([new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3)]).current;

  useEffect(() => {
    const native = Platform.OS !== 'web';
    const loop = Animated.loop(
      Animated.stagger(
        160,
        dots.map((d) =>
          Animated.sequence([
            Animated.timing(d, { toValue: 1, duration: 280, useNativeDriver: native }),
            Animated.timing(d, { toValue: 0.3, duration: 280, useNativeDriver: native }),
          ]),
        ),
      ),
    );
    loop.start();
    return () => loop.stop();
  }, [dots]);

  return (
    <View style={[styles.wrap, styles.left]} accessibilityLabel={`${name} está escribiendo`}>
      <View style={[styles.bubble, styles.in, styles.typing]}>
        <View style={styles.dots}>
          {dots.map((d, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: d, transform: [{ scale: d }] }]} />
          ))}
        </View>
        <AppText variant="caption" style={styles.time}>
          escribiendo…
        </AppText>
      </View>
    </View>
  );
}

export function DaySeparator({ label }: { label: string }) {
  return (
    <View style={styles.day}>
      <AppText variant="caption" style={styles.dayText}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18, maxWidth: '78%' },
  left: { alignSelf: 'flex-start' },
  right: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubble: { borderRadius: 18, paddingHorizontal: 18, paddingVertical: 13 },
  in: { backgroundColor: colors.surfaceMuted, borderBottomLeftRadius: 6, minWidth: 120 },
  out: { backgroundColor: colors.blue, borderBottomRightRadius: 6, paddingHorizontal: 20 },
  text: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 22, color: colors.text },
  time: { color: colors.textFaint, fontSize: 12 },
  metaOut: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, marginRight: 2 },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0, paddingVertical: 12 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textMuted },
  day: { alignSelf: 'center', marginVertical: 12 },
  dayText: {
    fontFamily: fonts.sansMedium,
    color: colors.textMuted,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
