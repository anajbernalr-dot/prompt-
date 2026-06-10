import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface ErrorBannerProps {
  message: string | null;
  onDismiss?: () => void;
  autoDismissMs?: number;
  type?: 'error' | 'warning' | 'success' | 'info';
}

export default function ErrorBanner({
  message,
  onDismiss,
  autoDismissMs,
  type = 'error',
}: ErrorBannerProps) {
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (message) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      if (autoDismissMs && onDismiss) {
        const timer = setTimeout(onDismiss, autoDismissMs);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [message]);

  if (!message) return null;

  const bgColor =
    type === 'error' ? Colors.danger :
    type === 'warning' ? Colors.warning :
    type === 'success' ? Colors.success :
    Colors.info;

  const iconName =
    type === 'error' ? 'alert-circle' :
    type === 'warning' ? 'warning' :
    type === 'success' ? 'checkmark-circle' :
    'information-circle';

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor, opacity }]}>
      <Ionicons name={iconName} size={18} color="#fff" style={styles.icon} />
      <Text style={styles.text} numberOfLines={3}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={16} color="#fff" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  icon: {
    flexShrink: 0,
  },
  text: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  dismiss: {
    flexShrink: 0,
    marginLeft: 4,
  },
});
