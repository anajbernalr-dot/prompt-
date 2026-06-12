import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface Props {
  message: string | null;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function ErrorBanner({ message, onDismiss, autoDismissMs = 4000 }: Props) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true }).start();
      if (autoDismissMs > 0) {
        const timer = setTimeout(onDismiss, autoDismissMs);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [message]);

  if (!message) return null;

  return (
    <Animated.View style={[styles.banner, { opacity }]}>
      <Ionicons name="alert-circle-outline" size={18} color={Colors.danger} />
      <Text style={styles.text} numberOfLines={2}>{message}</Text>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={18} color={Colors.subtext} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger + '22',
    borderColor: Colors.danger + '55',
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  text: {
    flex: 1,
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
