import React from 'react';
import { ActivityIndicator, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring, runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Colors, R, F } from '../../theme/colors';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'green';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
  icon?: string;
}

const bg: Record<Variant, string> = {
  primary: Colors.primary,
  secondary: Colors.bg3,
  ghost: 'transparent',
  danger: Colors.red,
  green: Colors.green,
};

const fg: Record<Variant, string> = {
  primary: '#fff',
  secondary: Colors.label1,
  ghost: Colors.primary,
  danger: '#fff',
  green: '#fff',
};

const padV: Record<Size, number> = { sm: 10, md: 14, lg: 17 };
const fontSize: Record<Size, number> = { sm: F.footnote, md: F.callout, lg: F.body };

export default function Button({ label, onPress, variant = 'primary', size = 'md', loading, disabled, style, fullWidth = false, icon }: Props) {
  const pressed = useSharedValue(0);

  const gesture = Gesture.Tap()
    .enabled(!disabled && !loading)
    .onBegin(() => { pressed.value = withSpring(1, { damping: 14, stiffness: 500 }); })
    .onFinalize((_, success) => {
      pressed.value = withSpring(0, { damping: 12, stiffness: 300 });
      if (success) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        runOnJS(onPress)();
      }
    });

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value === 1 ? 0.97 : 1 }],
    opacity: (disabled || loading) ? 0.45 : 1,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[
        styles.base,
        { backgroundColor: bg[variant], paddingVertical: padV[size], borderRadius: R.md },
        variant === 'secondary' && { borderWidth: 1, borderColor: Colors.sep },
        variant === 'ghost' && { borderWidth: 1, borderColor: Colors.primaryMid },
        fullWidth && { alignSelf: 'stretch' },
        style,
        anim,
      ]}>
        {loading
          ? <ActivityIndicator color={fg[variant]} />
          : <Text style={{ color: fg[variant], fontSize: fontSize[size], fontWeight: F.semibold, letterSpacing: 0.1 }}>
              {icon ? `${icon}  ${label}` : label}
            </Text>
        }
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
});
