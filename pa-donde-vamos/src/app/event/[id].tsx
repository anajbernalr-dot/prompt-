import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Button, IconButton } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { DetailNotFound } from '@/components/detail/DetailNotFound';
import { priceValue } from '@/components/detail/hours';
import { InfoRow } from '@/components/detail/InfoRow';
import { TicketSheet } from '@/components/detail/TicketSheet';
import { HowToGet } from '@/components/detail/HowToGet';
import { eventSpot } from '@/components/home/spots';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { VibesNote } from '@/components/detail/VibesNote';
import { Checkbox } from '@/components/Fields';
import { BackButton } from '@/components/Header';
import { FilledIcon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { Photo } from '@/components/Surfaces';
import { showToast } from '@/components/Toast';
import { AppText } from '@/components/Typography';
import { getEvent } from '@/data/events';
import { eventImage } from '@/data/images';
import type { AppEvent } from '@/data/types';
import { shareText, success, tap } from '@/lib/actions';
import { formatDateTime, formatDayShort, formatKm } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius } from '@/theme';

const GLASS = 'rgba(0, 0, 0, 0.3)';
const ON_DARK = 'rgba(255, 255, 255, 0.85)';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = getEvent(id);
  if (!event) {
    return (
      <DetailNotFound
        icon="calendar"
        title="No encontramos este evento"
        body="Puede que ya haya pasado o que el enlace esté malo. Mira lo que viene en Explorar."
        fallback="/explore"
      />
    );
  }
  return <EventDetail event={event} />;
}

function EventDetail({ event }: { event: AppEvent }) {
  const saved = useAppStore((s) => s.savedEvents.includes(event.id));
  const ticketCount = useAppStore((s) =>
    s.tickets.reduce((n, t) => (t.eventId === event.id ? n + t.qty : n), 0),
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);

  const free = priceValue(event.price) === 0;
  const weekday = formatDayShort(event.date).split(',')[0];
  const noun = free ? (ticketCount === 1 ? 'cupo' : 'cupos') : ticketCount === 1 ? 'entrada' : 'entradas';

  const toggleSave = () => {
    tap();
    useAppStore.getState().toggleSaveEvent(event.id);
    if (saved) showToast('Quitado de tus eventos', 'x');
    else {
      success();
      showToast('Guardado en tus eventos', 'bookmark');
    }
  };

  const share = async () => {
    const shared = await shareText(`${event.title} — ${formatDateTime(event.date)} en ${event.zone}. ¿Vamos? 🎶`);
    if (shared && Platform.OS === 'web') showToast('Enlace copiado', 'link');
  };

  const openSheet = () => {
    tap();
    setSheetKey((k) => k + 1);
    setSheetOpen(true);
  };

  const openTickets = async () => {
    if (!event.ticketUrl) return;
    tap();
    try {
      await WebBrowser.openBrowserAsync(event.ticketUrl);
    } catch {
      showToast('No pudimos abrir la página', 'alert-circle');
    }
  };
  const showTicketCta = free || !!event.ticketUrl;

  const goWithFriends = () => {
    useAppStore.getState().resetDraft({ category: 'evento', eventId: event.id, date: event.date });
    router.push('/plan/friends');
  };

  return (
    <Screen padded={false}>
      <View style={styles.wrap}>
        <View style={styles.panel}>
          <Photo source={eventImage(event.image)} rounded={0} style={styles.photo}>
            <LinearGradient
              colors={['rgba(21,21,26,0)', 'rgba(21,21,26,0.55)', colors.night]}
              locations={[0.3, 0.68, 1]}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)']} style={styles.topShade} />
            <View style={styles.topBar}>
              <BackButton color={colors.white} background={GLASS} fallback="/explore" />
              <IconButton
                icon="share-2"
                iconSize={20}
                size={42}
                color={colors.white}
                background={GLASS}
                onPress={share}
                accessibilityLabel="Compartir"
              />
            </View>
          </Photo>

          <View style={styles.body}>
            <View style={styles.dayPill}>
              <AppText style={styles.dayText}>{weekday}</AppText>
            </View>
            <AppText variant="h1" color={colors.white} accessibilityRole="header" style={styles.title}>
              {event.title}
            </AppText>
            <Chip label={event.category} tone="accent" size="sm" style={styles.chip} />

            <View style={styles.info}>
              <InfoRow icon="calendar" color={ON_DARK}>
                {formatDateTime(event.date)}
              </InfoRow>
              <InfoRow icon="map-pin" color={ON_DARK}>
                {event.zone} · {formatKm(event.distanceKm)}
              </InfoRow>
            </View>

            <AppText variant="body" color="rgba(255,255,255,0.8)" style={styles.description}>
              {event.description}
            </AppText>

            {ticketCount > 0 ? (
              <View style={styles.tickets}>
                <View style={styles.ticketIcon}>
                  <FilledIcon name="ticket" size={20} color={colors.white} />
                </View>
                <View style={styles.flex}>
                  <AppText variant="title" color={colors.white}>
                    Tienes {ticketCount} {noun}
                  </AppText>
                  <AppText variant="small" color="rgba(255,255,255,0.65)" numberOfLines={1}>
                    {free ? 'Muéstralos' : 'Muéstralas'} en la entrada de {event.venue}
                  </AppText>
                </View>
              </View>
            ) : null}

            <Pressable
              onPress={toggleSave}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: saved }}
              accessibilityLabel="Guardar evento"
              style={({ pressed }) => [styles.savePill, pressed && styles.savePillPressed]}>
              <Checkbox checked={saved} />
              <View style={styles.saveCenter}>
                <FilledIcon name={saved ? 'bookmark' : 'bookmark-outline'} size={19} color={colors.ink} />
                <AppText style={styles.saveLabel}>{saved ? 'Guardado' : 'Guardar'}</AppText>
              </View>
            </Pressable>

            <View style={styles.ctas}>
              {showTicketCta ? (
                <View>
                  <Button
                    label={free ? (ticketCount > 0 ? 'Reservar más' : 'Reservar cupo') : 'Comprar entradas'}
                    variant="accent"
                    fullWidth={false}
                    iconRight={free ? undefined : 'external-link'}
                    onPress={free ? openSheet : openTickets}
                    accessibilityLabel={free ? undefined : 'Comprar entradas en la página oficial'}
                    style={styles.cta}
                  />
                  {!free ? (
                    <AppText variant="small" color="rgba(255,255,255,0.6)" style={styles.caption}>
                      Te llevamos a la página oficial del evento
                    </AppText>
                  ) : null}
                </View>
              ) : null}
              <Button
                label="Ir con mis panas"
                variant="light"
                size="md"
                iconLeft="users"
                fullWidth={false}
                onPress={goWithFriends}
                style={styles.cta}
              />
            </View>
          </View>
        </View>
        <VibesNote style={styles.note} />
      </View>

      <View style={styles.below}>
        <HowToGet
          spot={eventSpot(event)}
          lat={event.lat}
          lng={event.lng}
          address={`${event.venue}, ${event.zone}`}
        />
        <ReviewsSection target={{ kind: 'event', id: event.id }} />
      </View>

      {free ? <TicketSheet key={sheetKey} event={event} visible={sheetOpen} onClose={() => setSheetOpen(false)} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { marginHorizontal: 12, marginBottom: 28 },
  panel: { backgroundColor: colors.night, borderRadius: 28, overflow: 'hidden' },
  photo: { height: 330 },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  topBar: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  body: { marginTop: -104, paddingHorizontal: 20, paddingBottom: 26 },
  dayPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    height: 28,
    justifyContent: 'center',
  },
  dayText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  title: { marginTop: 14 },
  chip: { marginTop: 14 },
  info: { gap: 12, marginTop: 18 },
  description: { marginTop: 18, lineHeight: 23 },
  tickets: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.nightSoft,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  ticketIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savePill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    marginTop: 22,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  savePillPressed: { backgroundColor: colors.surfaceMuted },
  saveCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginRight: 24 },
  saveLabel: { fontFamily: fonts.sansMedium, fontSize: 16, color: colors.ink },
  ctas: { marginTop: 16, gap: 12 },
  cta: { width: '64%' },
  caption: { marginTop: 8, marginLeft: 4 },
  below: { paddingHorizontal: 22, paddingBottom: 40 },
  note: { position: 'absolute', right: -2, bottom: -14 },
});
