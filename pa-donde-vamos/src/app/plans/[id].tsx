import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, IconButton } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { BackButton, goBack, Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { EmptyState, Photo } from '@/components/Surfaces';
import { showToast } from '@/components/Toast';
import { AppText, Title } from '@/components/Typography';
import { GlassesDoodle } from '@/components/illustrations';
import { describeTarget } from '@/components/plan/meta';
import { CancelPlanButton, InfoLine, PlanComment, PlanPeople } from '@/components/plan/PlanDetailParts';
import { getFriend } from '@/data/friends';
import type { Friend, Plan } from '@/data/types';
import { openDirections, shareText } from '@/lib/actions';
import { formatDayLong, formatKm, formatRelativeDay, formatTime } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius } from '@/theme';

const PLANS_FALLBACK = '/saved?tab=planes';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const stored = useAppStore((s) => s.plans.find((p) => p.id === id));
  const deletePlan = useAppStore((s) => s.deletePlan);
  // Keeps the screen rendered while it animates away after "Cancelar plan".
  const [closing, setClosing] = useState<Plan | null>(null);
  const plan = stored ?? closing;

  if (!plan) {
    return (
      <Screen>
        <Header fallback={PLANS_FALLBACK} />
        <EmptyState
          icon="calendar"
          title="Este plan ya no existe"
          body="Puede que lo hayan cancelado. Arma uno nuevo con tus panas."
          action={
            <View style={styles.emptyActions}>
              <Button label="Ver mis planes" onPress={() => router.replace(PLANS_FALLBACK)} />
              <Button label="Crear un plan" variant="ghost" onPress={() => router.replace('/plan/new')} />
            </View>
          }
        />
      </Screen>
    );
  }

  const t = describeTarget(plan);
  const people = plan.friendIds.map((f) => getFriend(f)).filter((f): f is Friend => !!f);
  const when = `${formatDayLong(plan.date)} · ${formatTime(plan.date)}`;
  const relative = formatRelativeDay(plan.date);
  const isPast = new Date(plan.date).getTime() < Date.now();
  const tag = isPast ? 'Ya pasó' : relative === 'Hoy' || relative === 'Mañana' ? relative : 'Próximo plan';

  const whereParts = [
    plan.title && t.place ? t.place.name : t.event?.venue,
    t.zone,
    t.distanceKm != null ? formatKm(t.distanceKm) : undefined,
  ].filter(Boolean);
  const openTarget = t.place
    ? () => router.push(`/place/${t.place!.id}`)
    : t.event
      ? () => router.push(`/event/${t.event!.id}`)
      : undefined;

  const invite = async () => {
    const where = t.zone ? ` en ${t.zone}` : '';
    const ok = await shareText(
      `¡Pa' donde vamos! ${t.name}${where}, ${formatDayLong(plan.date).toLowerCase()} a las ${formatTime(plan.date)}. ¿Te anotas?`,
    );
    if (ok) showToast('Invitación lista para enviar', 'send');
  };

  const cancel = () => {
    setClosing(plan);
    goBack(PLANS_FALLBACK);
    deletePlan(plan.id);
    showToast('Plan cancelado', 'x');
  };

  return (
    <Screen>
      {t.image ? (
        <Photo source={t.image} rounded={radius.xxl} style={styles.hero} gradient>
          <HeroBar onShare={invite} />
          <Chip label={tag} tone="accent" size="sm" style={styles.heroTag} />
        </Photo>
      ) : (
        <View style={[styles.hero, styles.heroEmpty]}>
          <GlassesDoodle width={150} />
          <HeroBar onShare={invite} dark />
          <Chip label={tag} tone="accent" size="sm" style={styles.heroTag} />
        </View>
      )}

      <Title style={styles.title}>{t.name}</Title>
      <View style={styles.lines}>
        <InfoLine icon="calendar" text={when} />
        {whereParts.length ? (
          <InfoLine icon="map-pin" text={whereParts.join(' · ')} onPress={openTarget} />
        ) : null}
      </View>

      <AppText variant="title" style={styles.section}>
        Con
      </AppText>
      <PlanPeople people={people} />

      {plan.comment ? (
        <>
          <AppText variant="title" style={styles.section}>
            Nota del plan
          </AppText>
          <PlanComment text={plan.comment} />
        </>
      ) : null}

      <View style={styles.actions}>
        {people[0] ? (
          <Button
            label="Abrir chat del plan"
            iconLeft="message-circle"
            onPress={() => router.push(`/chat/${people[0].id}`)}
          />
        ) : null}
        {t.coords ? (
          <Button
            label="Cómo llegar"
            variant="accent"
            iconRight="navigation"
            onPress={() => openDirections(t.coords!.lat, t.coords!.lng, t.place?.name ?? t.event?.venue ?? t.name)}
          />
        ) : null}
        <Button label="Invitar a más" variant="outline" iconLeft="user-plus" onPress={invite} />
        <CancelPlanButton onConfirm={cancel} />
      </View>
    </Screen>
  );
}

function HeroBar({ onShare, dark }: { onShare: () => void; dark?: boolean }) {
  const bg = dark ? colors.surface : 'rgba(10, 12, 18, 0.35)';
  const fg = dark ? colors.ink : colors.white;
  return (
    <View style={styles.heroBar}>
      <BackButton color={fg} background={bg} fallback={PLANS_FALLBACK} />
      <IconButton icon="share" color={fg} background={bg} accessibilityLabel="Compartir plan" onPress={onShare} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 300, marginTop: 4 },
  heroEmpty: {
    backgroundColor: colors.blueSoft,
    borderRadius: radius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroTag: { position: 'absolute', left: 16, bottom: 16 },
  title: { marginTop: 20, fontSize: 32, lineHeight: 37 },
  lines: { marginTop: 12, gap: 4 },
  section: { fontSize: 17, marginTop: 26, marginBottom: 12 },
  actions: { gap: 12, marginTop: 30 },
  emptyActions: { alignSelf: 'stretch', gap: 8, marginTop: 14 },
});
