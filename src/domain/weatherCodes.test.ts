import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from './weatherCodes';

describe('getWeatherCondition', () => {
  it('mapea despejado', () => {
    expect(getWeatherCondition(0)).toEqual({ family: 'clear', description: 'Despejado' });
  });

  it('mapea las ocho familias', () => {
    const cases: Array<[number, string]> = [
      [2, 'partly'],
      [3, 'cloudy'],
      [45, 'fog'],
      [51, 'drizzle'],
      [61, 'rain'],
      [71, 'snow'],
      [95, 'storm'],
    ];
    for (const [code, family] of cases) {
      expect(getWeatherCondition(code).family).toBe(family);
    }
  });

  it('cae en nublado y Desconocido', () => {
    expect(getWeatherCondition(999)).toEqual({ family: 'cloudy', description: 'Desconocido' });
  });
});
