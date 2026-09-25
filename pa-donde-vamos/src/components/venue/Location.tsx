import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { placeSpot } from '@/components/home/spots';
import { FilledIcon, Icon, type FilledIconName } from '@/components/Icon';
import { CityMap } from '@/components/map/CityMap';
import { MapPin } from '@/components/map/MapPin';
import { AppText, Handwritten } from '@/components/Typography';
import type { Place } from '@/data/types';
import { openDirections } from '@/lib/actions';
import { colors, fonts, radius } from '@/theme';

import { SectionHeader, StarDoodle } from './parts';

const HEIGHT = 230;
const ASPECT = 1.7;

export function LocationSection({ place, note }: { place: Place; note: string }) {
  const [width, setWidth] = useState(0);
  const spot = placeSpot(place);
  const mapH = width * ASPECT;
  const pinY = place.map.y * mapH;
  const offset = Math.min(Math.max(pinY - HEIGHT * 0.5, 0), Math.max(mapH - HEIGHT, 0));
  const pinX = place.map.x * width;
  const labelLeft = pinX > width * 0.55;
  const go = () => openDirections(place.lat, place.lng, place.name);
  const km = place.distanceKm;
  const modes: { key: string; label: string; icon: FilledIconName; min: number }[] = [
    { key: 'car', label: 'En carro', icon: 'car-outline', min: Math.max(4, Math.round(km * 4 + 6)) },
    { key: 'metro', label: 'En metro', icon: 'subway-outline', min: Math.max(8, Math.round(km * 5 + 11)) },
    { key: 'bike', label: 'En bici', icon: 'bicycle-outline', min: Math.max(5, Math.round(km * 13 + 7)) },
  ];

  return (
    <View style={styles.wrap}>
      <SectionHeader title="Ubicación" />
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={styles.map}>
        {width > 0 ? (
          <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, top: -offset, width, height: mapH }}>
            <CityMap width={width} height={mapH} />
            <MapPin spot={spot} x={pinX} y={pinY} selected={false} onPress={() => router.push(`/map?focus=${place.id}`)} />
            <View
              pointerEvents="none"
              style={[styles.label, labelLeft ? { right: width - pinX + 20 } : { left: pinX + 18 }, { top: pinY - 40 }]}>
              <AppText style={styles.labelText} numberOfLines={1}>
                {place.name}
              </AppText>
            </View>
          </View>
        ) : null}
        <View style={[styles.note, labelLeft ? styles.noteLeft : styles.noteRight]} pointerEvents="none">
          <Handwritten rotate={-12} size={17} style={styles.noteText}>
            {note.toUpperCase()}
          </Handwritten>
          <StarDoodle width={20} />
        </View>
      </View>
      <View style={styles.addr}>
        <Icon name="map-pin" size={15} color={colors.inkSoft} />
        <AppText style={styles.addrText}>{place.address}</AppText>
      </View>
      <Button label="Ver en mapa" size="md" onPress={() => router.push(`/map?focus=${place.id}`)} style={styles.btn} />

      <AppText style={styles.h3}>Cómo llegar</AppText>
      <View style={styles.modes}>
        {modes.map((m) => (
          <Pressable
            key={m.key}
            onPress={go}
            accessibilityRole="button"
            accessibilityLabel={`${m.label}, ${m.min} minutos`}
            style={({ pressed }) => [styles.mode, { opacity: pressed ? 0.7 : 1 }]}>
            <FilledIcon name={m.icon} size={19} color={colors.ink} />
            <View>
              <AppText style={styles.modeLabel}>{m.label}</AppText>
              <AppText style={styles.modeMin}>{m.min} min</AppText>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 40 },
  map: {
    height: HEIGHT,
    marginTop: 14,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: '#E7E4D5',
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, maxWidth: 170 },
  labelText: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.ink },
  note: { position: 'absolute', bottom: 14, alignItems: 'flex-end' },
  noteRight: { right: 14 },
  noteLeft: { left: 14 },
  noteText: { textAlign: 'center' },
  addr: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 },
  addrText: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.inkSoft },
  btn: { marginTop: 14 },
  h3: { fontFamily: fonts.serifBold, fontSize: 19, color: colors.ink, marginTop: 26 },
  modes: { flexDirection: 'row', gap: 8, marginTop: 12 },
  mode: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeLabel: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.ink },
  modeMin: { fontFamily: fonts.sans, fontSize: 12, color: colors.textMuted, marginTop: 1 },
});
