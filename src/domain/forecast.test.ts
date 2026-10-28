import { describe, expect, it } from 'vitest';
import { getDisplayDays, getNextHours } from './forecast';
import type { DailyPoint, HourlyPoint } from './types';

function makeHours(): HourlyPoint[] {
  const temperatures = [22, 22, 23, 22, 21, 20, 20, 20, 19, 18, 18, 17, 17, 16, 16, 15, 15];
  const start = Date.UTC(2026, 9, 28, 13);
  return temperatures.map((temperature, index) => ({
    time: `${new Date(start + index * 3_600_000).toISOString().slice(0, 13)}:00`,
    temperature,
    humidity: 75,
    precipitationProbability: 0,
    weatherCode: 0,
  }));
}

function makeDays(): DailyPoint[] {
  return Array.from({ length: 7 }, (_, index) => ({
    date: new Date(Date.UTC(2026, 9, 28 + index)).toISOString().slice(0, 10),
    weatherCode: 0,
    max: 25,
    min: 17,
    sunrise: '2026-10-28T07:30',
    sunset: '2026-10-28T18:30',
  }));
}

describe('getNextHours', () => {
  it('empieza en la hora en curso y devuelve ocho puntos', () => {
    const hours = getNextHours(makeHours(), '2026-10-28T14:30');
    expect(hours).toHaveLength(8);
    expect(hours[0]?.time).toBe('2026-10-28T14:00');
  });

  it('cruza la medianoche sin romper el orden', () => {
    const hours = getNextHours(makeHours(), '2026-10-28T22:10');
    expect(hours).toHaveLength(8);
    expect(hours[0]?.time).toBe('2026-10-28T22:00');
    expect(hours.at(-1)?.time).toBe('2026-10-29T05:00');
  });

  it('si no existe la hora exacta empieza en la primera posterior', () => {
    const hours = getNextHours(makeHours().slice(2), '2026-10-28T14:30');
    expect(hours[0]?.time).toBe('2026-10-28T15:00');
  });

  it('si la hora queda fuera de rango vuelve al principio', () => {
    const hours = getNextHours(makeHours(), '2026-10-29T14:30');
    expect(hours[0]?.time).toBe('2026-10-28T13:00');
  });

  it('admite un número de horas distinto', () => {
    expect(getNextHours(makeHours(), '2026-10-28T14:30', 3)).toHaveLength(3);
  });
});

describe('getDisplayDays', () => {
  it('devuelve los seis primeros días', () => {
    const days = getDisplayDays(makeDays());
    expect(days).toHaveLength(6);
    expect(days[0]?.date).toBe('2026-10-28');
    expect(days[5]?.date).toBe('2026-11-02');
  });
});
