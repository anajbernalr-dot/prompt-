import { useEffect, useState } from 'react';

/** "7:00 am" → minutes since midnight. */
function toMinutes(time: string): number | null {
  const m = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(time.trim());
  if (!m) return null;
  let hours = Number(m[1]) % 12;
  if (m[3].toLowerCase() === 'pm') hours += 12;
  return hours * 60 + Number(m[2]);
}

/** Whether a venue is open at `now`. Handles closing after midnight ("5:00 pm - 2:00 am"). */
export function isOpenAt(opens: string, closes: string, now: Date): boolean {
  const open = toMinutes(opens);
  const close = toMinutes(closes);
  if (open === null || close === null || open === close) return true;
  const current = now.getHours() * 60 + now.getMinutes();
  return close > open ? current >= open && current < close : current >= open || current < close;
}

/** Current time, refreshed every minute so "Abierto/Cerrado" stays correct while the screen is open. */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/** "$15" → 15, "Gratis" → 0. */
export function priceValue(price: string): number {
  const n = Number(price.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
