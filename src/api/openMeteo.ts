import type { CurrentWeather, DailyPoint, HourlyPoint, WeatherData } from '../domain/types';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

const CURRENT_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
].join(',');

const HOURLY_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'precipitation_probability',
  'weather_code',
].join(',');

const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'sunrise',
  'sunset',
].join(',');

export interface FetchWeatherOptions {
  latitude: number;
  longitude: number;
  signal?: AbortSignal;
}

interface OpenMeteoPayload {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
  };
}

export function buildForecastUrl(latitude: number, longitude: number): string {
  return `${BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=${CURRENT_FIELDS}&hourly=${HOURLY_FIELDS}&daily=${DAILY_FIELDS}&timezone=auto&forecast_days=7`;
}

export async function fetchWeather(
  options: FetchWeatherOptions,
  fetcher: typeof fetch = fetch,
): Promise<WeatherData> {
  const response = await fetcher(buildForecastUrl(options.latitude, options.longitude), {
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo ${response.status}`);
  }

  const payload = (await response.json()) as OpenMeteoPayload;

  const current: CurrentWeather = {
    temperature: payload.current.temperature_2m,
    apparentTemperature: payload.current.apparent_temperature,
    humidity: payload.current.relative_humidity_2m,
    windSpeed: payload.current.wind_speed_10m,
    weatherCode: payload.current.weather_code,
    isDay: payload.current.is_day === 1,
    time: payload.current.time,
  };

  const hourly: HourlyPoint[] = payload.hourly.time.map((time, index) => ({
    time,
    temperature: payload.hourly.temperature_2m[index] ?? 0,
    humidity: payload.hourly.relative_humidity_2m[index] ?? 0,
    precipitationProbability: payload.hourly.precipitation_probability[index] ?? 0,
    weatherCode: payload.hourly.weather_code[index] ?? 0,
  }));

  const daily: DailyPoint[] = payload.daily.time.map((date, index) => ({
    date,
    weatherCode: payload.daily.weather_code[index] ?? 0,
    max: payload.daily.temperature_2m_max[index] ?? 0,
    min: payload.daily.temperature_2m_min[index] ?? 0,
    sunrise: payload.daily.sunrise[index] ?? '',
    sunset: payload.daily.sunset[index] ?? '',
  }));

  return { timezone: payload.timezone, current, hourly, daily };
}
