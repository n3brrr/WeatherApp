// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FALLBACK_LOCATION, getUserLocation } from './geolocation';

interface GeoMockOptions {
  success?: boolean;
  latitude?: number;
  longitude?: number;
}

function mockGeolocation({ success = true, latitude = 40.4168, longitude = -3.7038 }: GeoMockOptions) {
  const getCurrentPosition = vi.fn(
    (
      onSuccess: PositionCallback,
      onError: PositionErrorCallback,
    ) => {
      if (success) {
        onSuccess({
          coords: { latitude, longitude },
        } as GeolocationPosition);
      } else {
        onError({ code: 1, message: 'denied' } as GeolocationPositionError);
      }
    },
  );

  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition },
    configurable: true,
  });

  return getCurrentPosition;
}

afterEach(() => {
  vi.useRealTimers();
  Object.defineProperty(navigator, 'geolocation', {
    value: undefined,
    configurable: true,
  });
});

describe('getUserLocation', () => {
  it('usa las coordenadas del navegador', async () => {
    const getCurrentPosition = mockGeolocation({});
    const location = await getUserLocation();

    expect(location).toEqual({
      latitude: 40.4168,
      longitude: -3.7038,
      source: 'gps',
    });
    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { timeout: 8000, maximumAge: 300000 },
    );
  });

  it('cae a Málaga si se deniega el permiso', async () => {
    mockGeolocation({ success: false });
    const location = await getUserLocation();

    expect(location.source).toBe('fallback');
    expect(location.latitude).toBe(FALLBACK_LOCATION.latitude);
    expect(location.longitude).toBe(FALLBACK_LOCATION.longitude);
    expect(location.notice).toContain('Málaga');
  });

  it('cae a Málaga si no hay geolocalización', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    });

    const location = await getUserLocation();
    expect(location.source).toBe('fallback');
    expect(location.notice).toContain('Málaga');
  });

  it('cae a Málaga si el permiso queda pendiente', async () => {
    vi.useFakeTimers();
    const getCurrentPosition = vi.fn();
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition },
      configurable: true,
    });

    const pending = getUserLocation(8000);
    await vi.advanceTimersByTimeAsync(8000);
    const location = await pending;

    expect(location.source).toBe('fallback');
    expect(location.notice).toBe('Permiso de ubicación pendiente');
  });
});
