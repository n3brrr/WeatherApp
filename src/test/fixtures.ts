import type { WeatherData } from '../domain/types';

function isoDate(dayOffset: number): string {
  return new Date(Date.UTC(2026, 9, 28 + dayOffset)).toISOString().slice(0, 10);
}

function isoHour(hourOffset: number): string {
  const start = Date.UTC(2026, 9, 28, 13);
  return `${new Date(start + hourOffset * 3_600_000).toISOString().slice(0, 13)}:00`;
}

const HOURLY_TEMPERATURES = [22, 22, 23, 22, 21, 20, 20, 20, 19, 18, 18, 17];
const DAILY_MAX = [25, 27, 26, 24, 23, 25, 26];
const DAILY_MIN = [17, 18, 17, 16, 15, 16, 17];
const DAILY_CODES = [0, 2, 3, 61, 2, 0, 1];

const BASE: WeatherData = {
  timezone: 'Europe/Madrid',
  current: {
    temperature: 23.4,
    apparentTemperature: 24,
    humidity: 77.6,
    windSpeed: 7.2,
    weatherCode: 0,
    isDay: true,
    time: '2026-10-28T14:30',
  },
  hourly: HOURLY_TEMPERATURES.map((temperature, index) => ({
    time: isoHour(index),
    temperature,
    humidity: 70 + (index % 8),
    precipitationProbability: 0,
    weatherCode: 0,
  })),
  daily: DAILY_MAX.map((max, index) => ({
    date: isoDate(index),
    weatherCode: DAILY_CODES[index] ?? 0,
    max,
    min: DAILY_MIN[index] ?? 16,
    sunrise: `${isoDate(index)}T07:30`,
    sunset: `${isoDate(index)}T18:30`,
  })),
};

export function makeWeatherData(overrides: Partial<WeatherData> = {}): WeatherData {
  return {
    ...BASE,
    ...overrides,
    current: { ...BASE.current, ...(overrides.current ?? {}) },
  };
}
