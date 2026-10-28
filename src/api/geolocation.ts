export interface UserLocation {
  latitude: number;
  longitude: number;
  source: 'gps' | 'fallback';
  notice?: string;
}

export const FALLBACK_LOCATION = {
  latitude: 36.7213,
  longitude: -4.4214,
} as const;

const FALLBACK_NOTICE = 'Ubicación de ejemplo · Málaga';
const PENDING_NOTICE = 'Permiso de ubicación pendiente';

export function getUserLocation(timeoutMs = 8000): Promise<UserLocation> {
  return new Promise((resolve) => {
    const fallback = (notice: string): UserLocation => ({
      latitude: FALLBACK_LOCATION.latitude,
      longitude: FALLBACK_LOCATION.longitude,
      source: 'fallback',
      notice,
    });

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(fallback(FALLBACK_NOTICE));
      return;
    }

    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(fallback(PENDING_NOTICE));
      }
    }, timeoutMs);

    const finish = (location: UserLocation) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve(location);
    };

    try {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          finish({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: 'gps',
          }),
        () => finish(fallback(FALLBACK_NOTICE)),
        { timeout: timeoutMs, maximumAge: 300000 },
      );
    } catch {
      finish(fallback(FALLBACK_NOTICE));
    }
  });
}
