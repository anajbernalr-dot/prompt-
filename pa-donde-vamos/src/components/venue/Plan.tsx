import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { FilledIcon, Icon } from '@/components/Icon';
import { CheersScene, PalmSunScene } from '@/components/illustrations';
import { Photo } from '@/components/Surfaces';
import { showToast } from '@/components/Toast';
import { AppText, Title } from '@/components/Typography';
import { placeImage } from '@/data/images';
import type { Place } from '@/data/types';
import { shareText, success } from '@/lib/actions';
import { atDay, formatKm } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radius } from '@/theme';

import { Pill } from './parts';

export function ReadyCta({ place, saved, onSave, onCreate }: { place: Place; saved: boolean; onSave: () => void; onCreate: () => void }) {
  const invite = async () => {
    const ok = await shareText(`¡Vamos a ${place.name} en ${place.zone}! 🙌 ¿Te anotas?`);
    if (ok && Platform.OS === 'web') showToast('Invitación copiada', 'link');
  };
  return (
    <View style={styles.ready}>
      <CheersScene width={210} />
      <AppText accessibilityRole="header" style={styles.readyTitle}>
        ¿Listo para{'\n'}el plan?
      </AppText>
      <AppText style={styles.readyBody}>Guarda este lugar, invita a tus panas o crea un plan para volver pronto.</AppText>
      <View style={styles.readyBtns}>
        <Button
          label={saved ? 'Guardado' : 'Guardar'}
          size="md"
          leading={<FilledIcon name={saved ? 'bookmark' : 'bookmark-outline'} size={17} color={colors.white} />}
          onPress={onSave}
        />
        <Button label="Invitar amigos" size="md" variant="outline" onPress={invite} />
        <Button label="Crear plan" size="md" variant="outline" onPress={onCreate} />
      </View>
    </View>
  );
}

const WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DAYS_LONG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const TIMES: Record<Place['category'], [number, number][]> = {
  cafe: [[7, 0], [8, 0], [9, 0], [10, 0]],
  restaurante: [[12, 30], [1 + 12, 30], [19, 0], [20, 30]],
  bar: [[18, 0], [20, 0], [21, 30], [23, 0]],
};
const fmtTime = ([h, m]: [number, number]) => `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;

export function InlinePlan({ place }: { place: Place }) {
  const friendIds = useAppStore((s) => s.friendIds);
  const [day, setDay] = useState(0);
  const [time, setTime] = useState(0);
  const [count, setCount] = useState(2);
  const [msg, setMsg] = useState('');
  const [planId, setPlanId] = useState<string | null>(null);
  const [created, setCreated] = useState<{ date: string; count: number } | null>(null);

  const days = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 4 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      return { i, label: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : `${WEEK[d.getDay()]} ${d.getDate()}` };
    });
  }, []);
  const times = TIMES[place.category];

  const create = () => {
    const [h, m] = times[time];
    const date = atDay(day, h, m);
    const store = useAppStore.getState();
    store.resetDraft({
      category: place.category,
      placeId: place.id,
      date,
      friendIds: friendIds.slice(0, Math.max(0, count - 1)),
      comment: msg.trim() || undefined,
    });
    const id = store.commitDraft();
    if (!id) {
      showToast('No pudimos crear el plan', 'x');
      return;
    }
    success();
    setPlanId(id);
    setCreated({ date, count });
  };

  if (planId && created) {
    const d = new Date(created.date);
    const [h, m] = [d.getHours(), d.getMinutes()];
    return (
      <View style={styles.done}>
        <PalmSunScene width={220} />
        <AppText accessibilityRole="header" style={styles.doneTitle}>
          ¡Listo!
        </AppText>
        <AppText style={styles.readyBody}>Tu plan a {place.name} ha sido creado.</AppText>
        <View style={styles.doneCard}>
          <View style={styles.doneRow}>
            <Icon name="calendar" size={16} color={colors.ink} />
            <AppText style={styles.doneText}>
              {DAYS_LONG[d.getDay()]}, {d.getDate()} de {MONTHS[d.getMonth()]} · {fmtTime([h, m])}
            </AppText>
          </View>
          <View style={styles.doneRow}>
            <Icon name="users" size={16} color={colors.ink} />
            <AppText style={styles.doneText}>{created.count} panas</AppText>
          </View>
          <Button label="Ver plan" size="md" onPress={() => router.push(`/plans/${planId}`)} style={styles.doneBtn} />
        </View>
        <Button label="Volver al inicio" variant="ghost" size="sm" onPress={() => router.navigate('/')} />
        <Button
          label="Crear otro plan"
          variant="ghost"
          size="sm"
          onPress={() => {
            setPlanId(null);
            setCreated(null);
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.form}>
      <Title level={2} style={styles.formTitle}>
        Crear plan
      </Title>
      <View style={styles.summary}>
        <Photo source={placeImage(place.image)} rounded={12} style={styles.thumb} />
        <View style={styles.flex}>
          <AppText style={styles.sumName} numberOfLines={1}>
            {place.name}
          </AppText>
          <AppText style={styles.sumMeta}>
            {place.categoryLabel} · {place.zone}
          </AppText>
          <View style={styles.sumRow}>
            <FilledIcon name="star" size={13} color={colors.star} />
            <AppText style={styles.sumMeta}>
              {place.rating.toFixed(1)} ({place.reviews}) · {formatKm(place.distanceKm)}
            </AppText>
          </View>
        </View>
      </View>

      <AppText style={styles.label}>Fecha</AppText>
      <View style={styles.row}>
        {days.map((d) => (
          <Pill key={d.i} label={d.label} tone="blue" selected={day === d.i} onPress={() => setDay(d.i)} />
        ))}
      </View>
      <AppText style={styles.label}>Hora</AppText>
      <View style={styles.row}>
        {times.map((t, i) => (
          <Pill key={i} label={fmtTime(t)} tone="blue" selected={time === i} onPress={() => setTime(i)} />
        ))}
      </View>
      <AppText style={styles.label}>¿Cuántos van?</AppText>
      <View style={styles.row}>
        {[2, 4, 6].map((n) => (
          <Pill key={n} label={String(n)} round selected={count === n} onPress={() => setCount(n)} />
        ))}
        <Pill
          label={count > 6 ? String(count) : '+'}
          round
          selected={count > 6}
          onPress={() => setCount((c) => (c < 8 ? 8 : Math.min(c + 2, 20)))}
        />
      </View>
      <AppText style={styles.label}>Mensaje opcional</AppText>
      <TextInput
        value={msg}
        onChangeText={setMsg}
        placeholder="¿Algo más que debamos saber?"
        placeholderTextColor={colors.placeholder}
        accessibilityLabel="Mensaje opcional"
        style={styles.input}
        maxLength={160}
      />
      <Button label="Crear plan" onPress={create} style={styles.create} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  ready: { alignItems: 'center', marginTop: 56 },
  readyTitle: { fontFamily: fonts.serifBlack, fontSize: 38, lineHeight: 41, letterSpacing: -0.8, color: colors.ink, textAlign: 'center', marginTop: 14 },
  readyBody: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.inkSoft, textAlign: 'center', marginTop: 12, paddingHorizontal: 12 },
  readyBtns: { alignSelf: 'stretch', gap: 12, marginTop: 22 },
  form: { marginTop: 56 },
  formTitle: { fontSize: 25, lineHeight: 30 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16 },
  thumb: { width: 72, height: 64 },
  sumName: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.ink },
  sumMeta: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  sumRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  label: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.ink, marginTop: 22, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontFamily: fonts.sans,
    fontSize: 14.5,
    color: colors.ink,
  },
  create: { marginTop: 24 },
  done: { alignItems: 'center', marginTop: 56 },
  doneTitle: { fontFamily: fonts.serifBlack, fontSize: 38, lineHeight: 42, color: colors.ink, marginTop: 12 },
  doneCard: {
    alignSelf: 'stretch',
    gap: 12,
    marginTop: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  doneText: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink },
  doneBtn: { marginTop: 4 },
});
