import { describe, expect, it } from 'vitest';
import { isNightAt, toLocalIso } from './daylight';
import type { DailyPoint } from './types';

const daily: DailyPoint[] = [
  {
    date: '2026-06-20',
    weatherCode: 0,
    max: 30,
    min: 20,
    sunrise: '2026-06-20T06:50',
    sunset: '2026-06-20T21:45',
  },
];

describe('toLocalIso', () => {
  it('convierte a la hora local del lugar', () => {
    expect(toLocalIso(new Date('2026-06-20T19:30:00Z'), 'Europe/Madrid')).toBe('2026-06-20T21:30');
  });
});

describe('isNightAt', () => {
  it('es de día a las 21:30 locales si el ocaso es a las 21:45', () => {
    expect(isNightAt(new Date('2026-06-20T19:30:00Z'), 'Europe/Madrid', daily)).toBe(false);
  });

  it('es de noche pasado el ocaso', () => {
    expect(isNightAt(new Date('2026-06-20T20:00:00Z'), 'Europe/Madrid', daily)).toBe(true);
  });

  it('es de noche antes del amanecer', () => {
    expect(isNightAt(new Date('2026-06-20T04:30:00Z'), 'Europe/Madrid', daily)).toBe(true);
  });

  it('usa el horario fijo si no hay datos solares del día', () => {
    expect(isNightAt(new Date('2026-06-21T20:00:00Z'), 'Europe/Madrid', daily)).toBe(true);
    expect(isNightAt(new Date('2026-06-21T12:00:00Z'), 'Europe/Madrid', daily)).toBe(false);
  });
});
