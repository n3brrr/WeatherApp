// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from '../domain/weatherCodes';
import { makeWeatherData } from '../test/fixtures';
import { renderCurrentWeather } from './currentWeather';

function render(data = makeWeatherData()): HTMLElement {
  const container = document.createElement('section');
  renderCurrentWeather(container, data, getWeatherCondition(data.current.weatherCode));
  return container;
}

describe('renderCurrentWeather', () => {
  it('pinta temperatura, unidad y descripción', () => {
    const container = render();
    expect(container.querySelector('.current__temp')?.textContent).toBe('23°');
    expect(container.querySelector('.current__unit')?.textContent).toBe('C');
    expect(container.querySelector('.current__description')?.textContent).toBe('Despejado');
  });

  it('pinta las tres métricas', () => {
    const container = render();
    expect(container.querySelector('.current__wind')?.textContent).toBe('7 km/h');
    expect(container.querySelector('.current__humidity')?.textContent).toBe('78%');
    expect(container.querySelector('.current__min')?.textContent).toBe('17°');
  });

  it('describe la temperatura para lectores de pantalla', () => {
    const container = render();
    expect(container.querySelector('h1')?.getAttribute('aria-label')).toBe(
      '23 grados Celsius',
    );
  });

  it('admite temperaturas negativas', () => {
    const base = makeWeatherData();
    const data = makeWeatherData({
      current: { ...base.current, temperature: -4 },
    });
    const container = render(data);
    expect(container.querySelector('.current__temp')?.textContent).toBe('-4°');
    expect(container.querySelector('h1')?.getAttribute('aria-label')).toBe(
      '-4 grados Celsius',
    );
  });

  it('incluye los tres iconos de métricas', () => {
    const container = render();
    expect(container.querySelectorAll('.current__metric svg')).toHaveLength(3);
  });
});
