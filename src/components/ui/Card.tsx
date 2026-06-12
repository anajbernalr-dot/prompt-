import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Colors, R } from '../../theme/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  elevated?: boolean;
  padded?: boolean;
}

export default function Card({ children, style, elevated = false, padded = true }: Props) {
  return (
    <View style={[styles.card, elevated && styles.elevated, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg2,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: Colors.sep,
  },
  elevated: {
    backgroundColor: Colors.bg3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  padded: { padding: 20 },
});
