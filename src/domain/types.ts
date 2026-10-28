export type WeatherFamily =
  | 'clear'
  | 'partly'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'storm';

export interface WeatherCondition {
  family: WeatherFamily;
  description: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
}

export interface HourlyPoint {
  time: string;
  temperature: number;
  humidity: number;
  precipitationProbability: number;
  weatherCode: number;
}

export interface DailyPoint {
  date: string;
  weatherCode: number;
  max: number;
  min: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  timezone: string;
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
}

export interface Place {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  isFallback: boolean;
}
