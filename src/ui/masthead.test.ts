// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import type { Place } from '../domain/types';
import { renderMasthead, renderMastheadLoading } from './masthead';

const place: Place = {
  name: 'Málaga, España',
  latitude: 36.7213,
  longitude: -4.4214,
  isFallback: false,
};

function render() {
  const container = document.createElement('header');
  renderMasthead(container, {
    place,
    today: '2026-10-28',
    coordinates: '36.72° N · 4.42° O',
  });
  return container;
}

describe('renderMasthead', () => {
  it('pinta marca, lugar, fecha y coordenadas', () => {
    const container = render();
    expect(container.querySelector('.masthead__brand')?.textContent).toBe('WEATHER APP');
    expect(container.querySelector('.masthead__place')?.textContent).toBe('Málaga, España');
    expect(container.querySelector('.masthead__date')?.textContent).toBe('MIÉ, 28 OCT');
    expect(container.querySelector('.masthead__coords')?.textContent).toBe(
      '36.72° N · 4.42° O',
    );
  });

  it('usa time con datetime para la fecha', () => {
    const date = render().querySelector('time.masthead__date');
    expect(date?.getAttribute('datetime')).toBe('2026-10-28');
  });

  it('guarda el nombre completo en title', () => {
    const longName = 'A'.repeat(80);
    const container = document.createElement('header');
    renderMasthead(container, {
      place: { ...place, name: longName },
      today: '2026-10-28',
      coordinates: '36.72° N · 4.42° O',
    });

    const name = container.querySelector('.masthead__place');
    expect(name?.textContent).toBe(longName);
    expect(name?.getAttribute('title')).toBe(longName);
  });

  it('pinta el aviso de ubicación', () => {
    const container = document.createElement('header');
    renderMasthead(container, {
      place,
      today: '2026-10-28',
      coordinates: '36.72° N · 4.42° O',
      notice: 'Ubicación de ejemplo · Málaga',
    });

    expect(container.querySelector('.masthead__notice')?.textContent).toBe(
      'Ubicación de ejemplo · Málaga',
    );
  });
});

describe('renderMastheadLoading', () => {
  it('muestra que se está resolviendo la ubicación', () => {
    const container = document.createElement('header');
    renderMastheadLoading(container);
    expect(container.textContent).toContain('UBICACIÓN…');
  });
});
