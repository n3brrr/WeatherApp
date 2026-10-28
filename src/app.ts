import type { Place, WeatherCondition, WeatherData } from './domain/types';
import type { UserLocation } from './api/geolocation';
import { getTodayDate, formatCoordinates, formatUpdatedAt } from './domain/format';
import { getDisplayDays, getNextHours } from './domain/forecast';
import { getWeatherCondition } from './domain/weatherCodes';
import { renderCurrentWeather } from './ui/currentWeather';
import { renderDailyForecast } from './ui/dailyForecast';
import { renderHero } from './ui/heroIllustration';
import { renderHourlyChart } from './ui/hourlyChart';
import { renderMasthead, renderMastheadLoading } from './ui/masthead';
import {
  createRefreshControl,
  setRefreshing,
  setUpdatedAt,
} from './ui/refresh';
import { clearStatus, renderError, renderLoading, renderNotice } from './ui/status';
import { mustQuery } from './utils/dom';

export interface AppDependencies {
  getLocation: () => Promise<UserLocation>;
  fetchWeather: (latitude: number, longitude: number) => Promise<WeatherData>;
  reverseGeocode: (latitude: number, longitude: number) => Promise<Place>;
  now: () => Date;
}

export interface AppController {
  start: () => Promise<void>;
  refresh: () => Promise<void>;
}

type AppStatus = 'loading' | 'ready' | 'error';

interface AppState {
  status: AppStatus;
  isRefreshing: boolean;
  weather?: WeatherData;
  place?: Place;
  location?: UserLocation;
  locationNotice?: string;
  lastUpdated?: Date;
}

export function createApp(root: ParentNode, deps: AppDependencies): AppController {
  const mastheadEl = mustQuery<HTMLElement>(root, '#masthead');
  const statusEl = mustQuery<HTMLElement>(root, '#status');
  const currentEl = mustQuery<HTMLElement>(root, '#current');
  const heroEl = mustQuery<HTMLElement>(root, '#hero');
  const dailyEl = mustQuery<HTMLElement>(root, '#daily');
  const hourlyEl = mustQuery<HTMLElement>(root, '#hourly');
  const footerEl = mustQuery<HTMLElement>(root, '#footer');

  const state: AppState = { status: 'loading', isRefreshing: false };

  const control = createRefreshControl(footerEl, () => {
    void refresh();
  });

  function renderWeather(data: WeatherData): WeatherCondition {
    const condition = getWeatherCondition(data.current.weatherCode);

    renderCurrentWeather(currentEl, data, condition);
    renderDailyForecast(
      dailyEl,
      getDisplayDays(data.daily),
      getTodayDate(data.current.time),
    );
    renderHourlyChart(hourlyEl, getNextHours(data.hourly, data.current.time));

    const night = isNight(state.lastUpdated ?? deps.now(), data.timezone);
    document.documentElement.dataset.theme = night ? 'night' : 'day';

    renderHero(heroEl, condition.family, !night, condition.description);

    return condition;
  }

  function renderPlace(): void {
    const { weather, place, locationNotice } = state;
    if (!weather || !place) {
      return;
    }

    renderMasthead(mastheadEl, {
      place,
      today: getTodayDate(weather.current.time),
      coordinates: formatCoordinates(place.latitude, place.longitude),
      notice: locationNotice,
    });
  }

  function updateUpdatedAt(): void {
    if (!state.weather || !state.lastUpdated) {
      return;
    }
    setUpdatedAt(
      control,
      `ACTUALIZADO ${formatUpdatedAt(state.lastUpdated, state.weather.timezone)}`,
    );
  }

  function isNight(date: Date, timeZone: string): boolean {
    const hour = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      hourCycle: 'h23',
      timeZone,
    })
      .formatToParts(date)
      .find((part) => part.type === 'hour')?.value;
    const hourNumber = Number(hour ?? '0');
    return hourNumber >= 20 || hourNumber < 8;
  }

  async function loadPlace(location: UserLocation): Promise<void> {
    let place: Place;

    try {
      place = await deps.reverseGeocode(location.latitude, location.longitude);
    } catch {
      place = {
        name: 'Tu ubicación',
        latitude: location.latitude,
        longitude: location.longitude,
        isFallback: true,
      };
    }

    state.place = place;

    if (state.status === 'ready' && state.weather) {
      renderPlace();
    }
  }

  async function start(): Promise<void> {
    state.status = 'loading';
    state.weather = undefined;
    state.place = undefined;
    state.lastUpdated = undefined;
    state.isRefreshing = false;

    setRefreshing(control, false);
    setUpdatedAt(control, '');
    renderMastheadLoading(mastheadEl);
    renderLoading(statusEl);

    let location: UserLocation;

    try {
      location = await deps.getLocation();
    } catch {
      state.status = 'error';
      renderError(statusEl, 'No se pudo obtener la ubicación', () => {
        void start();
      });
      return;
    }

    state.location = location;
    state.locationNotice = location.notice;

    try {
      const weather = await deps.fetchWeather(location.latitude, location.longitude);
      state.weather = weather;
      state.status = 'ready';
      state.lastUpdated = deps.now();
      state.place = {
        name: 'UBICACIÓN…',
        latitude: location.latitude,
        longitude: location.longitude,
        isFallback: location.source === 'fallback',
      };

      renderWeather(weather);
      renderPlace();
      updateUpdatedAt();
      clearStatus(statusEl);
    } catch {
      state.status = 'error';
      renderError(statusEl, 'No se pudo cargar el clima', () => {
        void start();
      });
      return;
    }

    void loadPlace(location);
  }

  async function refresh(): Promise<void> {
    if (state.isRefreshing) {
      return;
    }

    const location = state.location;

    if (!location || !state.weather) {
      await start();
      return;
    }

    state.isRefreshing = true;
    setRefreshing(control, true);

    try {
      const weather = await deps.fetchWeather(location.latitude, location.longitude);
      state.weather = weather;
      state.status = 'ready';
      state.lastUpdated = deps.now();

      renderWeather(weather);
      renderPlace();
      updateUpdatedAt();
      clearStatus(statusEl);
    } catch {
      renderNotice(statusEl, 'No se pudo actualizar el clima', {
        retry: () => {
          void refresh();
        },
      });
    } finally {
      state.isRefreshing = false;
      setRefreshing(control, false);
    }
  }

  return { start, refresh };
}
