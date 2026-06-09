import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';

interface Props {
  progress: number; // 0 to 1
  label?: string;
}

export function BreakEvenBar({ progress, label }: Props) {
  const animatedProgress = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withSpring(Math.min(1, Math.max(0, progress)), {
      damping: 14,
      stiffness: 80,
    });
    if (progress >= 1) {
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 700 }),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [progress]);

  const barStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      animatedProgress.value,
      [0, 0.5, 1],
      [Colors.danger, Colors.warning, Colors.accent]
    );
    return {
      width: `${animatedProgress.value * 100}%`,
      backgroundColor: color,
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.5,
  }));

  const percentage = Math.round(Math.min(1, progress) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label ?? 'Punto de Equilibrio'}</Text>
        <Text style={[styles.percentage, progress >= 1 && styles.percentageAccent]}>
          {percentage}%
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]} />
        <Animated.View style={[styles.glow, glowStyle]} />
      </View>
      {progress >= 1 && (
        <Text style={styles.achievedText}>¡Punto de equilibrio alcanzado!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: Colors.subtext,
    fontSize: 13,
    fontWeight: '500',
  },
  percentage: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  percentageAccent: {
    color: Colors.accent,
  },
  track: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  glow: {
    position: 'absolute',
    top: -4,
    left: 0,
    right: 0,
    bottom: -4,
    backgroundColor: Colors.accent,
    borderRadius: 5,
  },
  achievedText: {
    color: Colors.accent,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
});
