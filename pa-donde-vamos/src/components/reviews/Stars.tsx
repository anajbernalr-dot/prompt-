import { Pressable, StyleSheet, View } from 'react-native';

import { FilledIcon } from '@/components/Icon';
import { tap } from '@/lib/actions';
import { colors } from '@/theme';

/** Read-only stars, halves supported. */
export function Stars({ value, size = 15, color = colors.star }: { value: number; size?: number; color?: string }) {
  return (
    <View style={styles.row} accessibilityLabel={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <FilledIcon
          key={i}
          name={value >= i ? 'star' : value >= i - 0.5 ? 'star-half' : 'star-outline'}
          size={size}
          color={value >= i - 0.5 ? color : colors.borderStrong}
        />
      ))}
    </View>
  );
}

/** Tap a star for a full rating; tap the same star again to make it a half. */
export function StarInput({ value, onChange, size = 38 }: { value: number; onChange: (v: number) => void; size?: number }) {
  const press = (i: number) => {
    tap();
    if (value === i) onChange(i - 0.5);
    else onChange(i);
  };
  return (
    <View style={styles.inputRow} accessibilityRole="adjustable" accessibilityLabel={`Calificación: ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Pressable
          key={i}
          onPress={() => press(i)}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={`${i} estrella${i > 1 ? 's' : ''}`}
          style={({ pressed }) => [styles.starBtn, pressed && { transform: [{ scale: 0.9 }] }]}>
          <FilledIcon
            name={value >= i ? 'star' : value >= i - 0.5 ? 'star-half' : 'star-outline'}
            size={size}
            color={value >= i - 0.5 ? colors.star : colors.borderStrong}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
  inputRow: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  starBtn: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
});
