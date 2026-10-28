import type { WeatherCondition } from './types';

const CONDITIONS: Record<number, WeatherCondition> = {
  0: { family: 'clear', description: 'Despejado' },
  1: { family: 'clear', description: 'Despejado' },
  2: { family: 'partly', description: 'Parcialmente nublado' },
  3: { family: 'cloudy', description: 'Nublado' },
  45: { family: 'fog', description: 'Niebla' },
  48: { family: 'fog', description: 'Niebla' },
  51: { family: 'drizzle', description: 'Llovizna' },
  53: { family: 'drizzle', description: 'Llovizna' },
  55: { family: 'drizzle', description: 'Llovizna' },
  56: { family: 'drizzle', description: 'Llovizna helada' },
  57: { family: 'drizzle', description: 'Llovizna helada' },
  61: { family: 'rain', description: 'Lluvia' },
  63: { family: 'rain', description: 'Lluvia' },
  65: { family: 'rain', description: 'Lluvia' },
  66: { family: 'rain', description: 'Lluvia helada' },
  67: { family: 'rain', description: 'Lluvia helada' },
  71: { family: 'snow', description: 'Nieve' },
  73: { family: 'snow', description: 'Nieve' },
  75: { family: 'snow', description: 'Nieve' },
  77: { family: 'snow', description: 'Granos de nieve' },
  80: { family: 'rain', description: 'Chubascos' },
  81: { family: 'rain', description: 'Chubascos' },
  82: { family: 'rain', description: 'Chubascos' },
  85: { family: 'snow', description: 'Chubascos de nieve' },
  86: { family: 'snow', description: 'Chubascos de nieve' },
  95: { family: 'storm', description: 'Tormenta' },
  96: { family: 'storm', description: 'Tormenta con granizo' },
  99: { family: 'storm', description: 'Tormenta con granizo' },
};

const UNKNOWN: WeatherCondition = { family: 'cloudy', description: 'Desconocido' };

export function getWeatherCondition(code: number): WeatherCondition {
  return CONDITIONS[code] ?? UNKNOWN;
}
