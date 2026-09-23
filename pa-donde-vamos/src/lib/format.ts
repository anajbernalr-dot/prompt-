// Spanish date/time helpers. Hand-rolled so output is identical on iOS,
// Android and web regardless of the device's Intl locale data.

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAYS_LONG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const toDate = (d: string | Date) => (typeof d === 'string' ? new Date(d) : d);

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const dayDiff = (a: Date, b: Date) =>
  Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86_400_000);

/** "10:00 am", "8:00 pm" */
export function formatTime(d: string | Date): string {
  const date = toDate(d);
  let h = date.getHours();
  const m = date.getMinutes();
  const suffix = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, '0')} ${suffix}`;
}

/** "Sáb, 26 abr" */
export function formatDayShort(d: string | Date): string {
  const date = toDate(d);
  return `${DAYS_SHORT[date.getDay()]}, ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

/** "Sábado, 26 abr" */
export function formatDayLong(d: string | Date): string {
  const date = toDate(d);
  return `${DAYS_LONG[date.getDay()]}, ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

/** "Sáb, 26 abr · 8:00 pm" */
export function formatDateTime(d: string | Date): string {
  return `${formatDayShort(d)} · ${formatTime(d)}`;
}

/** "Hoy", "Mañana", or "Sáb, 26 abr" */
export function formatRelativeDay(d: string | Date, now: Date = new Date()): string {
  const diff = dayDiff(toDate(d), now);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  return formatDayShort(d);
}

/** "Hace 2 h", "Hace 5 min", "Ayer", "Hace 3 d" (past) — or "Mañana · 10:00 am" (future). */
export function formatTimeAgo(d: string | Date, now: Date = new Date()): string {
  const date = toDate(d);
  const ms = now.getTime() - date.getTime();
  if (ms < 0) return `${formatRelativeDay(date, now)} · ${formatTime(date)}`;
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'Ayer';
  return `Hace ${days} d`;
}

/** "1.4 km" */
export function formatKm(km: number): string {
  return `${km.toFixed(1)} km`;
}

/**
 * ISO string for the next given weekday (0 = Sunday … 6 = Saturday) at hh:mm.
 * If today is that weekday and the time hasn't passed, returns today.
 */
export function nextWeekday(weekday: number, hours: number, minutes = 0, from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate(), hours, minutes, 0, 0);
  let add = (weekday - d.getDay() + 7) % 7;
  if (add === 0 && d.getTime() <= from.getTime()) add = 7;
  d.setDate(d.getDate() + add);
  return d.toISOString();
}

/** ISO string for `hoursAgo` hours before now. */
export function hoursAgo(hoursAgoValue: number, from: Date = new Date()): string {
  return new Date(from.getTime() - hoursAgoValue * 3_600_000).toISOString();
}

/** ISO string for today (+ dayOffset) at hh:mm. */
export function atDay(dayOffset: number, hours: number, minutes = 0, from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + dayOffset, hours, minutes, 0, 0);
  return d.toISOString();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).join(' ');
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

export function makeHandle(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
  return base || 'pana';
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
