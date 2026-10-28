// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, type AppDependencies } from './app';
import type { Place } from './domain/types';
import type { UserLocation } from './api/geolocation';
import { makeWeatherData } from './test/fixtures';

const MALAGA: UserLocation = {
  latitude: 36.7213,
  longitude: -4.4214,
  source: 'gps',
};

const MALAGA_PLACE: Place = {
  name: 'Málaga, España',
  latitude: 36.7213,
  longitude: -4.4214,
  isFallback: false,
};

function mountDom(): void {
  document.body.innerHTML = `
    <header id="masthead"></header>
    <div id="status"></div>
    <section id="current"></section>
    <div id="hero"></div>
    <section id="daily"></section>
    <section id="hourly"></section>
    <footer id="footer"></footer>
  `;
}

function makeDeps(overrides: Partial<AppDependencies> = {}): AppDependencies {
  return {
    getLocation: vi.fn(async () => MALAGA),
    fetchWeather: vi.fn(async () => makeWeatherData()),
    reverseGeocode: vi.fn(async () => MALAGA_PLACE),
    now: () => new Date('2026-10-28T09:24:00Z'),
    ...overrides,
  };
}

afterEach(() => {
  document.body.replaceChildren();
});

describe('createApp', () => {
  it('pinta clima actual, seis días y ocho horas', async () => {
    mountDom();
    const app = createApp(document, makeDeps());

    await app.start();

    expect(document.querySelector('.current__temp')?.textContent).toBe('23°');
    expect(document.querySelectorAll('#daily .daily__row')).toHaveLength(6);
    expect(document.querySelectorAll('#hourly .hourly__dot')).toHaveLength(8);
    expect(document.querySelector('#hero .hero__svg')).not.toBeNull();
  });

  it('rellena el lugar después de pintar el clima', async () => {
    mountDom();
    const app = createApp(document, makeDeps());

    await app.start();

    expect(document.querySelector('.current__temp')?.textContent).toBe('23°');
    await vi.waitFor(() => {
      expect(document.querySelector('.masthead__place')?.textContent).toBe('Málaga, España');
    });
  });

  it('activa el tema nocturno entre las 20:00 y las 08:00', async () => {
    mountDom();
    const app = createApp(document, makeDeps({ now: () => new Date('2026-10-28T23:30:00Z') }));

    await app.start();

    expect(document.documentElement.dataset.theme).toBe('night');
    expect(document.querySelector('#hero .hero__svg')?.getAttribute('data-variant')).toBe('night');
  });

  it('mantiene el clima si falla la geocodificación inversa', async () => {
    mountDom();
    const deps = makeDeps({
      reverseGeocode: vi.fn(async () => {
        throw new Error('offline');
      }),
    });
    const app = createApp(document, deps);

    await app.start();

    expect(document.querySelector('.current__temp')?.textContent).toBe('23°');
    await vi.waitFor(() => {
      expect(document.querySelector('.masthead__place')?.textContent).toBe('Tu ubicación');
    });
  });

  it('conserva los datos y avisa si falla una actualización', async () => {
    mountDom();
    const fetchWeather = vi
      .fn<AppDependencies['fetchWeather']>()
      .mockResolvedValueOnce(makeWeatherData())
      .mockRejectedValueOnce(new Error('offline'));
    const app = createApp(document, makeDeps({ fetchWeather }));

    await app.start();
    await app.refresh();

    expect(document.querySelector('.current__temp')?.textContent).toBe('23°');
    expect(document.querySelector('.status__notice')?.textContent).toContain(
      'No se pudo actualizar el clima',
    );
    expect(document.querySelector<HTMLButtonElement>('.footer__refresh')?.disabled).toBe(false);
  });

  it('no vuelve a pedir ubicación al actualizar', async () => {
    mountDom();
    const deps = makeDeps();
    const app = createApp(document, deps);

    await app.start();
    await app.refresh();

    expect(deps.getLocation).toHaveBeenCalledTimes(1);
    expect(deps.fetchWeather).toHaveBeenCalledTimes(2);
  });

  it('muestra el aviso de ubicación en el encabezado', async () => {
    mountDom();
    const location: UserLocation = {
      ...MALAGA,
      source: 'fallback',
      notice: 'Ubicación de ejemplo · Málaga',
    };
    const app = createApp(
      document,
      makeDeps({ getLocation: vi.fn(async () => location) }),
    );

    await app.start();
    await vi.waitFor(() => {
      expect(document.querySelector('.masthead__notice')?.textContent).toBe(
        'Ubicación de ejemplo · Málaga',
      );
    });
  });

  it('muestra un error inicial y permite reintentar', async () => {
    mountDom();
    const fetchWeather = vi
      .fn<AppDependencies['fetchWeather']>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(makeWeatherData());
    const app = createApp(document, makeDeps({ fetchWeather }));

    await app.start();

    expect(document.querySelector('.status__error')).not.toBeNull();
    expect(document.querySelector('.current__temp')).toBeNull();

    document.querySelector<HTMLButtonElement>('.status__retry')?.click();

    await vi.waitFor(() => {
      expect(document.querySelector('.current__temp')?.textContent).toBe('23°');
    });
  });
});
