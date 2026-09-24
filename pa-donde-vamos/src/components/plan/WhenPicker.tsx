import { StyleSheet, View } from 'react-native';

import { ChipRow } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { AppText } from '@/components/Typography';
import { atDay, formatDayLong, formatTime } from '@/lib/format';
import { colors } from '@/theme';

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/** Time slots in minutes after midnight: 9 am … 10 pm. */
export const TIME_SLOTS = [9 * 60, 10 * 60, 12 * 60, 15 * 60, 18 * 60, 20 * 60, 22 * 60];
const DEFAULT_SLOT = 10 * 60;
const DAY_COUNT = 7;

const minutesNow = (now: Date) => now.getHours() * 60 + now.getMinutes();

/** Slots still available on `day` (today only keeps future times). */
export function slotsFor(day: number, now: Date = new Date()) {
  return day === 0 ? TIME_SLOTS.filter((s) => s > minutesNow(now)) : TIME_SLOTS;
}

/** Day + slot to preselect from an existing draft date (default: tomorrow 10:00 am). */
export function initialWhen(iso?: string, now: Date = new Date()): { day: number; slot: number } {
  if (iso) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const day = Math.round((dayStart - start) / 86_400_000);
      const slot = d.getHours() * 60 + d.getMinutes();
      if (day >= 0 && day < DAY_COUNT && slotsFor(day, now).length > 0) {
        return { day, slot: TIME_SLOTS.includes(slot) ? slot : DEFAULT_SLOT };
      }
    }
  }
  return { day: 1, slot: DEFAULT_SLOT };
}

/** Resolve the slot actually used (falls back to the first free one today). */
export function effectiveSlot(day: number, slot: number, now: Date = new Date()) {
  const free = slotsFor(day, now);
  return free.includes(slot) ? slot : (free[0] ?? DEFAULT_SLOT);
}

export function composeWhen(day: number, slot: number, now: Date = new Date()) {
  const s = effectiveSlot(day, slot, now);
  return atDay(day, Math.floor(s / 60), s % 60, now);
}

function dayLabel(offset: number, now: Date) {
  if (offset === 0) return 'Hoy';
  if (offset === 1) return 'Mañana';
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
  return `${DAYS_SHORT[d.getDay()]} ${d.getDate()}`;
}

function slotLabel(slot: number) {
  const h = Math.floor(slot / 60);
  const m = slot % 60;
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`;
}

/** "¿Cuándo?" — day chips (Hoy, Mañana, Sáb 26…) and time chips. */
export function WhenPicker({
  day,
  slot,
  onChange,
}: {
  day: number;
  slot: number;
  onChange: (next: { day: number; slot: number }) => void;
}) {
  const now = new Date();
  const days = Array.from({ length: DAY_COUNT }, (_, i) => i)
    .filter((i) => slotsFor(i, now).length > 0)
    .map((i) => ({ key: String(i), label: dayLabel(i, now) }));
  const slots = slotsFor(day, now).map((s) => ({ key: String(s), label: slotLabel(s) }));
  const current = effectiveSlot(day, slot, now);
  const iso = composeWhen(day, slot, now);

  return (
    <View style={styles.wrap}>
      <AppText variant="h3">¿Cuándo?</AppText>
      <ChipRow options={days} value={String(day)} onChange={(k) => onChange({ day: Number(k), slot })} />
      <ChipRow options={slots} value={String(current)} onChange={(k) => onChange({ day, slot: Number(k) })} />
      <View style={styles.summary}>
        <Icon name="calendar" size={15} color={colors.blue} />
        <AppText variant="small" color={colors.blueInk} weight="medium">
          {`${formatDayLong(iso)} · ${formatTime(iso)}`}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
});
