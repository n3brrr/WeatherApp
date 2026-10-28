import { describe, expect, it, vi } from 'vitest';
import { buildForecastUrl, fetchWeather } from './openMeteo';

const raw = {
  timezone: 'Europe/Madrid',
  current: {
    time: '2026-10-28T14:30',
    temperature_2m: 23.4,
    relative_humidity_2m: 77,
    apparent_temperature: 24,
    is_day: 1,
    weather_code: 0,
    wind_speed_10m: 7.2,
  },
  hourly: {
    time: ['2026-10-28T13:00', '2026-10-28T14:00'],
    temperature_2m: [22, 23],
    relative_humidity_2m: [70, 77],
    precipitation_probability: [0, 0],
    weather_code: [0, 0],
  },
  daily: {
    time: ['2026-10-28'],
    weather_code: [0],
    temperature_2m_max: [25],
    temperature_2m_min: [17],
    sunrise: ['2026-10-28T07:30'],
    sunset: ['2026-10-28T18:30'],
  },
};

function jsonFetcher(status: number): typeof fetch {
  return (async () => new Response(JSON.stringify(raw), { status })) as typeof fetch;
}

describe('buildForecastUrl', () => {
  it('incluye coordenadas y campos pedidos', () => {
    const url = buildForecastUrl(36.72, -4.42);
    expect(url).toContain('latitude=36.72');
    expect(url).toContain('longitude=-4.42');
    expect(url).toContain('current=temperature_2m');
    expect(url).toContain('weather_code');
    expect(url).toContain('timezone=auto');
    expect(url).toContain('forecast_days=7');
  });
});

describe('fetchWeather', () => {
  it('normaliza la respuesta', async () => {
    const data = await fetchWeather({ latitude: 36.72, longitude: -4.42 }, jsonFetcher(200));
    expect(data.current.temperature).toBe(23.4);
    expect(data.current.isDay).toBe(true);
    expect(data.hourly[0]?.temperature).toBe(22);
    expect(data.daily[0]?.max).toBe(25);
    expect(data.timezone).toBe('Europe/Madrid');
  });

  it('lanza un error con el estado HTTP', async () => {
    const promise = fetchWeather({ latitude: 36.72, longitude: -4.42 }, jsonFetcher(500));
    await expect(promise).rejects.toThrow('500');
  });

  it('pasa la señal de aborto al fetcher', async () => {
    const fetcher = vi.fn(jsonFetcher(200));
    const controller = new AbortController();
    await fetchWeather(
      { latitude: 36.72, longitude: -4.42, signal: controller.signal },
      fetcher,
    );
    expect(fetcher).toHaveBeenCalledWith(expect.any(String), { signal: controller.signal });
  });
});
