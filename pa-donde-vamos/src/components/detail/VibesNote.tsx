import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Asterisk, LeafDoodle } from '@/components/illustrations';
import { Handwritten } from '@/components/Typography';
import { colors, shadow } from '@/theme';

/** Cream sticky note "THE GOOD VIBES" that sits over the event panel's corner. Decorative only. */
export function VibesNote({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.note, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.pin} />
      <LeafDoodle width={30} style={styles.leaf} />
      <Handwritten rotate={-3} size={25} style={styles.text}>
        {'The\nGood\nVibes'}
      </Handwritten>
      <Asterisk width={22} style={styles.asterisk} />
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    width: 118,
    height: 142,
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingTop: 22,
    paddingLeft: 16,
    transform: [{ rotate: '8deg' }],
    pointerEvents: 'none',
    ...shadow,
  },
  pin: {
    position: 'absolute',
    left: -7,
    top: 44,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.blue,
    backgroundColor: colors.surface,
  },
  leaf: { position: 'absolute', top: 6, right: 8 },
  text: { lineHeight: 26 },
  asterisk: { position: 'absolute', bottom: 10, right: 30 },
});
