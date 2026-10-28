// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { makeWeatherData } from '../test/fixtures';
import { renderDailyForecast } from './dailyForecast';

function render(data = makeWeatherData()): HTMLElement {
  const container = document.createElement('section');
  renderDailyForecast(container, data.daily, '2026-10-28');
  return container;
}

describe('renderDailyForecast', () => {
  it('renderiza exactamente seis filas', () => {
    expect(render().querySelectorAll('.daily__row')).toHaveLength(6);
  });

  it('marca hoy y abrevia el resto', () => {
    const rows = render().querySelectorAll('.daily__row');
    expect(rows[0]?.querySelector('.daily__day')?.textContent).toBe('HOY');
    expect(rows[1]?.querySelector('.daily__day')?.textContent).toBe('JUE');
  });

  it('usa time con datetime en cada fila', () => {
    const times = render().querySelectorAll('time.daily__day');
    expect(times).toHaveLength(6);
    expect(times[0]?.getAttribute('datetime')).toBe('2026-10-28');
  });

  it('muestra máximas y mínimas', () => {
    const container = render();
    expect(container.querySelector('.daily__max')?.textContent).toBe('25°');
    expect(container.querySelector('.daily__min')?.textContent).toBe('17°');
  });

  it('incluye un icono con familia en cada fila', () => {
    const icons = render().querySelectorAll('.daily__icon svg');
    expect(icons).toHaveLength(6);
    for (const icon of icons) {
      expect(icon.getAttribute('data-family')).toBeTruthy();
    }
  });

  it('etiqueta la lista', () => {
    expect(render().querySelector('.daily__label')?.textContent).toBe('PRÓXIMOS DÍAS');
  });
});
