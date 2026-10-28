// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import {
  createRefreshControl,
  setRefreshing,
  setUpdatedAt,
} from './refresh';

function mount(onRefresh = vi.fn()) {
  const container = document.createElement('footer');
  const control = createRefreshControl(container, onRefresh);
  return { container, control, onRefresh };
}

describe('createRefreshControl', () => {
  it('crea fuente, actualización y botón', () => {
    const { container, control } = mount();

    expect(container.querySelector('.footer__source')?.textContent).toBe('OPEN-METEO');
    expect(container.querySelector('.footer__updated')).toBe(control.updated);
    expect(container.querySelector('.footer__refresh')?.textContent).toBe('ACTUALIZAR');
    expect(control.button.getAttribute('aria-label')).toBe('Actualizar datos del clima');
    expect(control.button.type).toBe('button');
  });

  it('llama al callback al pulsar', () => {
    const { control, onRefresh } = mount();
    control.button.click();
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});

describe('setRefreshing', () => {
  it('deshabilita y marca el botón mientras carga', () => {
    const { control } = mount();

    setRefreshing(control, true);
    expect(control.button.disabled).toBe(true);
    expect(control.button.classList.contains('is-refreshing')).toBe(true);

    setRefreshing(control, false);
    expect(control.button.disabled).toBe(false);
    expect(control.button.classList.contains('is-refreshing')).toBe(false);
  });
});

describe('setUpdatedAt', () => {
  it('actualiza el texto', () => {
    const { control } = mount();
    setUpdatedAt(control, 'ACTUALIZADO 10:24');
    expect(control.updated.textContent).toBe('ACTUALIZADO 10:24');
  });
});
