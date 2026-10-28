import { describe, expect, it } from 'vitest';
import {
  formatCoordinates,
  formatDayLabel,
  formatHourLabel,
  formatHumidity,
  formatPlaceDate,
  formatTemperature,
  formatTemperatureWithUnit,
  formatUpdatedAt,
  formatWind,
  getDateInTimeZone,
  getTodayDate,
} from './format';

describe('formatTemperature', () => {
  it('redondea y añade el grado', () => {
    expect(formatTemperature(23.4)).toBe('23°');
    expect(formatTemperature(-3.6)).toBe('-4°');
  });

  it('añade la unidad Celsius', () => {
    expect(formatTemperatureWithUnit(23.4)).toBe('23°C');
  });
});

describe('formatWind y formatHumidity', () => {
  it('redondea con su unidad', () => {
    expect(formatWind(7.2)).toBe('7 km/h');
    expect(formatHumidity(77.6)).toBe('78%');
  });
});

describe('formatCoordinates', () => {
  it('usa hemisferios en español', () => {
    expect(formatCoordinates(36.7213, -4.4214)).toBe('36.72° N · 4.42° O');
  });
});

describe('getDateInTimeZone', () => {
  it('cruza la medianoche según la zona del lugar', () => {
    expect(getDateInTimeZone(new Date('2026-10-28T23:30:00Z'), 'Europe/Madrid')).toBe(
      '2026-10-29',
    );
  });
});

describe('formatPlaceDate', () => {
  it('formatea día y mes en mayúsculas', () => {
    expect(formatPlaceDate('2026-10-28')).toBe('MIÉ, 28 OCT');
  });
});

describe('formatDayLabel', () => {
  it('marca hoy y abrevia el resto', () => {
    expect(formatDayLabel('2026-10-28', '2026-10-28')).toBe('HOY');
    expect(formatDayLabel('2026-10-29', '2026-10-28')).toBe('JUE');
  });
});

describe('formatHourLabel', () => {
  it('recorta la hora', () => {
    expect(formatHourLabel('2026-10-28T14:00')).toBe('14:00');
  });
});

describe('formatUpdatedAt', () => {
  it('usa la hora local del lugar', () => {
    expect(formatUpdatedAt(new Date('2026-10-28T09:24:00Z'), 'Europe/Madrid')).toBe('10:24');
  });
});

describe('getTodayDate', () => {
  it('extrae la fecha del instante local', () => {
    expect(getTodayDate('2026-10-28T14:30')).toBe('2026-10-28');
  });
});
