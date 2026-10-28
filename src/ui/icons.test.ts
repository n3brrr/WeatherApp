import { describe, expect, it } from 'vitest';
import { metricIcon, weatherIcon } from './icons';
import type { WeatherFamily } from '../domain/types';

const families: WeatherFamily[] = [
  'clear',
  'partly',
  'cloudy',
  'fog',
  'drizzle',
  'rain',
  'snow',
  'storm',
];

describe('weatherIcon', () => {
  it('genera un svg decorativo por familia', () => {
    for (const family of families) {
      const markup = weatherIcon(family, true);
      expect(markup).toContain('<svg');
      expect(markup).toContain('aria-hidden="true"');
      expect(markup).toContain(`data-family="${family}"`);
    }
  });

  it('cambia la variante de noche', () => {
    expect(weatherIcon('clear', false)).toContain('data-variant="night"');
    expect(weatherIcon('clear', true)).toContain('data-variant="day"');
  });

  it('acepta un tamaño', () => {
    expect(weatherIcon('rain', true, 32)).toContain('width="32"');
  });
});

describe('metricIcon', () => {
  it('genera iconos decorativos', () => {
    for (const kind of ['wind', 'humidity', 'min'] as const) {
      const markup = metricIcon(kind);
      expect(markup).toContain('<svg');
      expect(markup).toContain('aria-hidden="true"');
      expect(markup).toContain(`data-icon="${kind}"`);
    }
  });
});
