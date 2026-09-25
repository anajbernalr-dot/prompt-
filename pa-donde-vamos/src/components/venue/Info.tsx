import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { isOpenAt } from '@/components/detail/hours';
import { FilledIcon, Icon, type FilledIconName, type IconName } from '@/components/Icon';
import { showToast } from '@/components/Toast';
import { AppText } from '@/components/Typography';
import type { Place } from '@/data/types';
import type { DayHours, VenueExtras } from '@/data/venueExtras';
import { openDirections, tap } from '@/lib/actions';
import { colors, fonts, radius } from '@/theme';

import { SectionHeader } from './parts';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function Tags({ tags }: { tags: string[] }) {
  return (
    <View style={styles.tags}>
      {tags.map((t) => (
        <Chip key={t} label={t} tone="tag" size="sm" style={styles.tag} />
      ))}
    </View>
  );
}

const label = (h: DayHours) => (h ? `${h.opens} – ${h.closes}` : 'Cerrado');

export function Hours({ week, now }: { week: DayHours[]; now: Date }) {
  const [open, setOpen] = useState(false);
  const today = now.getDay();
  const h = week[today];
  const isOpen = !!h && isOpenAt(h.opens, h.closes, now);
  return (
    <View style={styles.block}>
      <Pressable
        onPress={() => {
          tap();
          setOpen((v) => !v);
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel="Horarios"
        style={styles.hoursHead}>
        <View style={styles.flex}>
          <AppText style={styles.h3}>Horarios</AppText>
          <AppText style={styles.hoursLine}>Hoy · {label(h)}</AppText>
          <AppText style={[styles.status, { color: isOpen ? colors.success : colors.danger }]}>
            {isOpen ? 'Abierto' : 'Cerrado'}
          </AppText>
        </View>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.ink} />
      </Pressable>
      {open ? (
        <View style={styles.week}>
          {week.map((d, i) => (
            <View key={DAYS[i]} style={styles.dayRow}>
              <AppText style={[styles.day, i === today && styles.today]}>{DAYS[i]}</AppText>
              <AppText style={[styles.dayHours, i === today && styles.today, !d && styles.closed]}>{label(d)}</AppText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

type Action = { key: string; label: string; icon?: IconName; filled?: FilledIconName; onPress: () => void };

export function QuickActions({ place, extras, onReserve }: { place: Place; extras: VenueExtras; onReserve: () => void }) {
  const actions: Action[] = [
    {
      key: 'call',
      label: 'Llamar',
      icon: 'phone',
      onPress: () => Linking.openURL(`tel:${extras.phone.replace(/\s/g, '')}`).catch(() => showToast(extras.phone, 'phone')),
    },
    {
      key: 'web',
      label: 'Website',
      icon: 'globe',
      onPress: () => WebBrowser.openBrowserAsync(extras.website).catch(() => showToast('No pudimos abrir la web', 'x')),
    },
    { key: 'go', label: 'Cómo llegar', filled: 'home', onPress: () => openDirections(place.lat, place.lng, place.name) },
    { key: 'book', label: 'Reservar', filled: 'calendar-clear-outline', onPress: onReserve },
  ];
  return (
    <View style={styles.actions}>
      {actions.map((a) => (
        <Pressable
          key={a.key}
          onPress={() => {
            tap();
            a.onPress();
          }}
          accessibilityRole="button"
          accessibilityLabel={a.label}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.7 : 1 }]}>
          <View style={styles.circle}>
            {a.icon ? <Icon name={a.icon} size={21} color={colors.ink} /> : <FilledIcon name={a.filled!} size={21} color={colors.ink} />}
          </View>
          <AppText style={styles.actionText}>{a.label}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

export function About({ text }: { text: string }) {
  const [more, setMore] = useState(false);
  return (
    <View style={styles.block}>
      <SectionHeader title="Sobre el lugar" />
      <AppText style={styles.about} numberOfLines={more ? undefined : 3}>
        {text}
        {more ? ' Un equipo que te trata como en casa, buena música y espacio para ir con los panas. Acepta pagos en divisas y pago móvil.' : ''}
      </AppText>
      <Pressable onPress={() => setMore((v) => !v)} accessibilityRole="button" hitSlop={10} style={styles.moreBtn}>
        <AppText style={styles.more}>{more ? 'Ver menos' : 'Ver más'}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 26 },
  tag: { height: 32, paddingHorizontal: 13, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.borderStrong },
  block: { marginTop: 30 },
  hoursHead: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  h3: { fontFamily: fonts.serifBold, fontSize: 19, color: colors.ink },
  hoursLine: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.inkSoft, marginTop: 6 },
  status: { fontFamily: fonts.sansSemi, fontSize: 13.5, marginTop: 4 },
  week: { marginTop: 12, padding: 14, gap: 8, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { fontFamily: fonts.sans, fontSize: 14, color: colors.inkSoft },
  dayHours: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  today: { fontFamily: fonts.sansBold, color: colors.blue },
  closed: { color: colors.danger },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 26 },
  action: { alignItems: 'center', gap: 8, width: 78 },
  circle: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.ink },
  about: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 23, color: colors.inkSoft, marginTop: 10 },
  moreBtn: { marginTop: 8, alignSelf: 'flex-start' },
  more: { fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.blue, textDecorationLine: 'underline' },
});
