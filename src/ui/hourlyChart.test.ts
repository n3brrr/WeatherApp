// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { getNextHours } from '../domain/forecast';
import { makeWeatherData } from '../test/fixtures';
import { renderHourlyChart } from './hourlyChart';

function render(): HTMLElement {
  const data = makeWeatherData();
  const hours = getNextHours(data.hourly, data.current.time);
  const container = document.createElement('section');
  renderHourlyChart(container, hours);
  return container;
}

describe('renderHourlyChart', () => {
  it('dibuja ocho puntos, uno marcado como ahora', () => {
    const container = render();
    expect(container.querySelectorAll('.hourly__dot')).toHaveLength(8);
    expect(container.querySelectorAll('.hourly__dot--now')).toHaveLength(1);
  });

  it('pinta ocho temperaturas y ocho horas', () => {
    const container = render();
    expect(container.querySelectorAll('.hourly__temp')).toHaveLength(8);
    expect(container.querySelectorAll('.hourly__time')).toHaveLength(8);
    expect(container.querySelector('.hourly__temp')?.textContent).toBe('22°');
    expect(container.querySelector('.hourly__time')?.textContent).toBe('14:00');
    expect(container.querySelectorAll('.hourly__time')[7]?.textContent).toBe('21:00');
  });

  it('traza la línea de temperatura', () => {
    const path = render().querySelector('path.hourly__line');
    expect(path).not.toBeNull();
    expect(path?.getAttribute('d')).toBeTruthy();
  });

  it('describe la gráfica para lectores de pantalla', () => {
    const svg = render().querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelector('title')?.textContent).toContain('Próximas 8 horas');
  });

  it('etiqueta la sección', () => {
    expect(render().querySelector('.hourly__label')?.textContent).toBe('PRÓXIMAS 8 HORAS');
  });
});
