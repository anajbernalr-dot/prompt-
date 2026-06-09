import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  GestureResponderEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Product } from '../store/useStore';
import { formatCurrency } from '../utils/calculations';

interface Props {
  product: Product;
  onPress: (product: Product) => void;
  onLongPress: (product: Product, pageX: number, pageY: number) => void;
  inCombo?: boolean;
}

export function ProductButton({ product, onPress, onLongPress, inCombo = false }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: false }),
      Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start();
    onPress(product);
  };

  const handleLongPress = (e: GestureResponderEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const { pageX, pageY } = e.nativeEvent;
    onLongPress(product, pageX, pageY);
  };

  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.card, Colors.primary + '55'],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={400}
      activeOpacity={0.9}
      style={styles.wrapper}
    >
      <Animated.View
        style={[
          styles.button,
          { transform: [{ scale: scaleAnim }], backgroundColor },
          inCombo && styles.inCombo,
        ]}
      >
        {product.stock === 0 && <View style={styles.outOfStockOverlay} />}
        <Text style={styles.emoji}>{product.emoji}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        {product.stock > 0 && product.stock <= 5 && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>{product.stock} restantes</Text>
          </View>
        )}
        {product.stock === 0 && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Agotado</Text>
          </View>
        )}
        {inCombo && (
          <View style={styles.comboBadge}>
            <Text style={styles.comboText}>✓</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 5,
  },
  button: {
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  inCombo: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  name: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  price: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  lowStockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.warning + 'CC',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  lowStockText: {
    color: Colors.background,
    fontSize: 9,
    fontWeight: '700',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    zIndex: 1,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.danger + 'CC',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    zIndex: 2,
  },
  outOfStockText: {
    color: Colors.text,
    fontSize: 9,
    fontWeight: '700',
  },
  comboBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  comboText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
});
