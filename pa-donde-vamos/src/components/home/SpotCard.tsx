import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Photo } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import { colors, fonts } from '@/theme';

import type { Spot } from './spots';

/** Small photo card for "Cerca de ti" ("La Bodeguita · Bar · Chacao"). */
export function SpotCard({ spot, width = 165, height = 155 }: { spot: Spot; width?: number; height?: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${spot.name}, ${spot.meta}`}
      onPress={() => router.push(spot.href)}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <Photo source={spot.image} rounded={18} gradient style={{ width, height, justifyContent: 'flex-end' }}>
        <View style={styles.texts}>
          <AppText style={styles.name} numberOfLines={2}>
            {spot.name}
          </AppText>
          <AppText style={styles.meta} numberOfLines={1}>
            {spot.meta}
          </AppText>
        </View>
      </Photo>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  texts: { paddingHorizontal: 12, paddingBottom: 12, gap: 3 },
  name: { fontFamily: fonts.sansSemi, fontSize: 15, lineHeight: 19, color: colors.white },
  meta: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: 'rgba(255,255,255,0.85)' },
});
