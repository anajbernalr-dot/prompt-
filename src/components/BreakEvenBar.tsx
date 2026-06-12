import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring, withTiming,
  withSequence, withRepeat, interpolateColor, Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, R, F } from '../theme/colors';

const W = Dimensions.get('window').width;

interface Props {
  progress: number;    // 0–100
  netRevenue: number;
  breakEven: number;
  netProfit: number;
}

export default function BreakEvenBar({ progress, netRevenue, breakEven, netProfit }: Props) {
  const anim = useSharedValue(0);
  const glow = useSharedValue(0);
  const achieved = progress >= 100;

  useEffect(() => {
    anim.value = withSpring(Math.min(progress / 100, 1), {
      damping: 18, stiffness: 80, mass: 1,
    });
    if (achieved) {
      glow.value = withRepeat(
        withSequence(withTiming(1, { duration: 900 }), withTiming(0.4, { duration: 900 })),
        -1, true
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      glow.value = withTiming(0);
    }
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${anim.value * 100}%`,
    backgroundColor: interpolateColor(
      anim.value,
      [0, 0.5, 1],
      [Colors.orange, Colors.primary, Colors.green]
    ),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    shadowOpacity: glow.value * 0.8,
  }));

  const pct = Math.min(Math.round(progress), 100);
  const remaining = Math.max(breakEven - netRevenue, 0);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Break-even</Text>
          <Text style={styles.sub}>
            {achieved ? '¡Objetivo superado! 🎉' : `Faltan €${remaining.toFixed(0)}`}
          </Text>
        </View>
        <View style={styles.pctContainer}>
          <Text style={[styles.pct, achieved && { color: Colors.green }]}>{pct}%</Text>
        </View>
      </View>

      {/* Track */}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle, achieved && styles.fillAchieved, glowStyle]} />
        {/* Midpoint tick */}
        <View style={styles.midTick} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footLabel}>€0</Text>
        <Text style={styles.footLabel}>€{(breakEven / 2).toFixed(0)}</Text>
        <Text style={[styles.footLabel, achieved && { color: Colors.green }]}>€{breakEven.toFixed(0)}</Text>
      </View>

      {achieved && (
        <Animated.View style={[styles.profitPill, glowStyle]}>
          <Text style={styles.profitText}>
            +€{netProfit.toFixed(2)} beneficio neto
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 20, paddingVertical: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  label: { fontSize: F.footnote, fontWeight: F.semibold, color: Colors.label3, letterSpacing: 0.5, textTransform: 'uppercase' },
  sub: { fontSize: F.sub, fontWeight: F.medium, color: Colors.label2, marginTop: 2 },
  pctContainer: { alignItems: 'flex-end' },
  pct: { fontSize: F.title1, fontWeight: F.bold, color: Colors.label1, letterSpacing: -1 },
  track: {
    height: 8, backgroundColor: Colors.bg4, borderRadius: R.full, overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%', borderRadius: R.full,
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12, elevation: 4,
  },
  fillAchieved: { shadowColor: Colors.green },
  midTick: {
    position: 'absolute', left: '50%', top: -2, width: 1,
    height: 12, backgroundColor: Colors.sep, marginLeft: -0.5,
  },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  footLabel: { fontSize: F.micro, color: Colors.label4, fontWeight: F.medium },
  profitPill: {
    marginTop: 12, alignSelf: 'center',
    backgroundColor: Colors.greenSoft, borderRadius: R.full,
    paddingHorizontal: 16, paddingVertical: 6,
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 16,
  },
  profitText: { fontSize: F.footnote, fontWeight: F.semibold, color: Colors.green },
});
