import { describe, expect, it } from 'vitest';
import { buildReverseGeocodeUrl, reverseGeocode } from './reverseGeocode';

function jsonFetcher(payload: unknown, status = 200): typeof fetch {
  return (async () => new Response(JSON.stringify(payload), { status })) as typeof fetch;
}

const coordinates = { latitude: 36.7213, longitude: -4.4214 };

describe('buildReverseGeocodeUrl', () => {
  it('incluye coordenadas e idioma', () => {
    const url = buildReverseGeocodeUrl(36.7213, -4.4214);
    expect(url).toContain('latitude=36.7213');
    expect(url).toContain('longitude=-4.4214');
    expect(url).toContain('localityLanguage=es');
  });
});

describe('reverseGeocode', () => {
  it('compone ciudad y país', async () => {
    const place = await reverseGeocode(
      coordinates,
      jsonFetcher({ city: 'Málaga', countryName: 'España' }),
    );
    expect(place.name).toBe('Málaga, España');
    expect(place.isFallback).toBe(false);
    expect(place.latitude).toBe(36.7213);
    expect(place.longitude).toBe(-4.4214);
  });

  it('usa la localidad si falta la ciudad', async () => {
    const place = await reverseGeocode(coordinates, jsonFetcher({ locality: 'Centro' }));
    expect(place.name).toContain('Centro');
  });

  it('no repite el país si coincide con el nombre', async () => {
    const place = await reverseGeocode(
      coordinates,
      jsonFetcher({ city: 'España', countryName: 'España' }),
    );
    expect(place.name).toBe('España');
  });

  it('cae a Tu ubicación sin lanzar', async () => {
    const fetcher = (async () => {
      throw new Error('offline');
    }) as typeof fetch;
    const place = await reverseGeocode(coordinates, fetcher);
    expect(place.name).toBe('Tu ubicación');
    expect(place.isFallback).toBe(true);
    expect(place.latitude).toBe(36.7213);
    expect(place.longitude).toBe(-4.4214);
  });

  it('cae a Tu ubicación con una respuesta no válida', async () => {
    const place = await reverseGeocode(coordinates, jsonFetcher({}, 500));
    expect(place.name).toBe('Tu ubicación');
    expect(place.isFallback).toBe(true);
  });

  it('cae a Tu ubicación si no hay ningún nombre', async () => {
    const place = await reverseGeocode(coordinates, jsonFetcher({ countryName: 'España' }));
    expect(place.name).toBe('Tu ubicación');
    expect(place.isFallback).toBe(true);
  });
});
