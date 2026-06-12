import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, R, F } from '../../theme/colors';

type Variant = 'green' | 'red' | 'orange' | 'blue' | 'brand';

const bg: Record<Variant, string> = {
  green: Colors.greenSoft, red: Colors.redSoft, orange: Colors.orangeSoft,
  blue: Colors.blueSoft, brand: Colors.primarySoft,
};
const fg: Record<Variant, string> = {
  green: Colors.green, red: Colors.red, orange: Colors.orange,
  blue: Colors.blue, brand: Colors.primary,
};

interface Props { label: string; variant?: Variant; }

export default function Badge({ label, variant = 'brand' }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: bg[variant] }]}>
      <Text style={[styles.text, { color: fg[variant] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 3 },
  text: { fontSize: F.caption, fontWeight: F.semibold },
});
