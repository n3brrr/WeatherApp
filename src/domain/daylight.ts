import type { DailyPoint } from './types';

/** Fecha y hora locales del lugar como `YYYY-MM-DDTHH:mm`. */
export function toLocalIso(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).formatToParts(date);
  const get = (type: string): string => parts.find((part) => part.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/**
 * Es de noche si el momento cae antes del amanecer o después del ocaso del día
 * local. Si no hay datos solares para ese día, se usa el horario 20:00–08:00.
 */
export function isNightAt(date: Date, timeZone: string, daily: DailyPoint[]): boolean {
  const local = toLocalIso(date, timeZone);
  const today = daily.find((day) => day.date === local.slice(0, 10));

  if (today?.sunrise && today.sunset) {
    return local < today.sunrise || local >= today.sunset;
  }

  const hour = Number(local.slice(11, 13));
  return hour >= 20 || hour < 8;
}
