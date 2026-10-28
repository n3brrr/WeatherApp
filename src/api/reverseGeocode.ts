import type { Place } from '../domain/types';

const BASE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

export interface ReverseGeocodeOptions {
  latitude: number;
  longitude: number;
  signal?: AbortSignal;
}

interface ReverseGeocodePayload {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
}

export function buildReverseGeocodeUrl(latitude: number, longitude: number): string {
  return `${BASE_URL}?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`;
}

export async function reverseGeocode(
  options: ReverseGeocodeOptions,
  fetcher: typeof fetch = fetch,
): Promise<Place> {
  const fallback = (): Place => ({
    name: 'Tu ubicación',
    latitude: options.latitude,
    longitude: options.longitude,
    isFallback: true,
  });

  try {
    const response = await fetcher(buildReverseGeocodeUrl(options.latitude, options.longitude), {
      signal: options.signal,
    });

    if (!response.ok) {
      return fallback();
    }

    const payload = (await response.json()) as ReverseGeocodePayload;
    const base =
      payload.city?.trim() ||
      payload.locality?.trim() ||
      payload.principalSubdivision?.trim() ||
      '';

    if (!base) {
      return fallback();
    }

    const country = payload.countryName?.trim();
    const name = country && country !== base ? `${base}, ${country}` : base;

    return {
      name,
      country,
      latitude: options.latitude,
      longitude: options.longitude,
      isFallback: false,
    };
  } catch {
    return fallback();
  }
}
