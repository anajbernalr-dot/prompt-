import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import type { Spot } from '@/components/home/spots';
import { FilledIcon, Icon } from '@/components/Icon';
import { Card, Photo } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import { formatDateTime, formatKm } from '@/lib/format';
import { colors, fonts } from '@/theme';

/** Bottom card for the selected pin; opens the place / event detail. */
export function MapPreview({ spot }: { spot: Spot }) {
  const enter = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    enter.setValue(0);
    Animated.spring(enter, {
      toValue: 1,
      friction: 7,
      tension: 80,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [spot.id, enter]);

  return (
    <Animated.View
      style={{
        opacity: enter.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
        transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}>
      <Card
        onPress={() => router.push(spot.href)}
        accessibilityLabel={`Ver ${spot.name}`}
        style={styles.card}>
        <Photo source={spot.image} rounded={14} style={styles.thumb} />
        <View style={styles.texts}>
          <AppText style={styles.name} numberOfLines={1}>
            {spot.name}
          </AppText>
          <AppText variant="small" numberOfLines={1}>
            {spot.meta}
          </AppText>
          {spot.place ? (
            <View style={styles.meta}>
              <FilledIcon name="star" size={14} color={colors.star} />
              <AppText style={styles.metaText} numberOfLines={1}>
                {spot.place.rating.toFixed(1)} ({spot.place.reviews}) · {formatKm(spot.distanceKm)}
              </AppText>
            </View>
          ) : spot.event ? (
            <View style={styles.meta}>
              <Icon name="calendar" size={13} color={colors.blue} />
              <AppText style={styles.metaText} numberOfLines={1}>
                {formatDateTime(spot.event.date)} · {formatKm(spot.distanceKm)}
              </AppText>
            </View>
          ) : null}
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 22 },
  thumb: { width: 76, height: 76 },
  texts: { flex: 1, gap: 4 },
  name: { fontFamily: fonts.sansBold, fontSize: 17, lineHeight: 22, color: colors.ink },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  metaText: { fontFamily: fonts.sansMedium, fontSize: 13.5, color: colors.text },
});
