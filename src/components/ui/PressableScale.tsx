import React from 'react';
import { ViewStyle, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  scale?: number;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  disabled?: boolean;
}

export default function PressableScale({
  children,
  onPress,
  onLongPress,
  style,
  scale = 0.96,
  haptic = 'light',
  disabled = false,
}: Props) {
  const pressed = useSharedValue(0);

  const triggerHaptic = () => {
    if (haptic === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (haptic === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (haptic === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const gesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      pressed.value = withSpring(1, { damping: 15, stiffness: 400 });
    })
    .onFinalize((e, success) => {
      pressed.value = withSpring(0, { damping: 12, stiffness: 300 });
      if (success && onPress) {
        runOnJS(triggerHaptic)();
        runOnJS(onPress)();
      }
    });

  const longPressGesture = Gesture.LongPress()
    .enabled(!disabled && !!onLongPress)
    .minDuration(400)
    .onStart(() => {
      if (onLongPress) {
        runOnJS(triggerHaptic)();
        runOnJS(onLongPress)();
      }
    });

  const composed = Gesture.Race(longPressGesture, gesture);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(pressed.value === 1 ? scale : 1, { duration: 80 }) }],
    opacity: disabled ? 0.45 : 1,
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[style, animStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
