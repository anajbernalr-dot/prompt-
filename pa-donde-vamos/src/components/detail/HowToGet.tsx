import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Spot } from '@/components/home/spots';
import { Icon } from '@/components/Icon';
import { CityMap } from '@/components/map/CityMap';
import { MapPin } from '@/components/map/MapPin';
import { UserLocation } from '@/components/map/UserLocation';
import { AppText, Handwritten, Title } from '@/components/Typography';
import { openDirections } from '@/lib/actions';
import { formatKm } from '@/lib/format';
import { colors, fonts, radius } from '@/theme';

const HEIGHT = 180;
const ME = { x: 0.5, y: 0.57 };
/** The stylized map is drawn tall (like the Map tab) and cropped around the pin. */
const ASPECT = 1.7;

export function HowToGet({
  spot,
  lat,
  lng,
  address,
  title = 'Cómo llegar',
}: {
  spot: Spot;
  lat: number;
  lng: number;
  address: string;
  title?: string;
}) {
  const [width, setWidth] = useState(0);
  const mapH = width * ASPECT;
  const midY = (spot.map.y * 0.65 + ME.y * 0.35) * mapH;
  const offset = Math.min(Math.max(midY - HEIGHT / 2, -40), Math.max(mapH - HEIGHT, 0));
  const go = () => openDirections(lat, lng, spot.name);

  return (
    <View style={styles.wrap}>
      <Title level={2} style={styles.title}>
        {title}
      </Title>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={styles.map}>
        {width > 0 ? (
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: -offset, width, height: mapH }}>
            <CityMap width={width} height={mapH} />
            <UserLocation x={ME.x * width} y={ME.y * mapH} />
            <MapPin spot={spot} x={spot.map.x * width} y={spot.map.y * mapH} selected onPress={go} />
          </View>
        ) : null}
        <Pressable
          onPress={go}
          accessibilityRole="button"
          accessibilityLabel={`Abrir indicaciones a ${spot.name}`}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.badge} pointerEvents="none">
          <Icon name="navigation" size={14} color={colors.white} />
          <AppText style={styles.badgeText}>Abrir mapa</AppText>
        </View>
        <Handwritten rotate={-7} size={17} style={styles.note} pointerEvents="none">
          a {formatKm(spot.distanceKm)} de ti
        </Handwritten>
      </View>
      <View style={styles.addressRow}>
        <Icon name="map-pin" size={17} color={colors.inkSoft} />
        <AppText style={styles.address}>{address}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 32 },
  title: { fontSize: 24, lineHeight: 29 },
  map: {
    height: HEIGHT,
    marginTop: 14,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: '#E7E4D5',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  badgeText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.white },
  note: { position: 'absolute', left: 14, bottom: 16 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  address: { flex: 1, fontFamily: fonts.sans, fontSize: 15, color: colors.inkSoft },
});
