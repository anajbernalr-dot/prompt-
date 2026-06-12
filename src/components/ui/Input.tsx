import React, { useRef, useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Colors, R, F } from '../../theme/colors';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  containerStyle?: ViewStyle;
}

export default function Input({ label, error, prefix, suffix, containerStyle, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(
      error ? Colors.red : focused ? Colors.primary : Colors.sep,
      { duration: 180 }
    ),
  }));

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.container, borderStyle]}>
        {prefix && <Text style={styles.fix}>{prefix}</Text>}
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.label4}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {suffix && <Text style={styles.fix}>{suffix}</Text>}
      </Animated.View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: F.footnote, fontWeight: F.medium, color: Colors.label3, marginBottom: 6 },
  container: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg3, borderRadius: R.md,
    borderWidth: 1, paddingHorizontal: 14,
  },
  input: {
    flex: 1, color: Colors.label1, fontSize: F.body,
    paddingVertical: 13, fontWeight: F.regular,
  },
  fix: { fontSize: F.body, color: Colors.label3, marginHorizontal: 2 },
  error: { fontSize: F.caption, color: Colors.red, marginTop: 4 },
});
