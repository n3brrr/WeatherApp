// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { clearStatus, renderError, renderLoading, renderNotice } from './status';

function container(): HTMLElement {
  return document.createElement('div');
}

describe('renderLoading', () => {
  it('muestra CARGANDO', () => {
    const element = container();
    renderLoading(element);
    expect(element.querySelector('.status__loading')?.textContent).toBe('CARGANDO');
  });
});

describe('renderError', () => {
  it('muestra el mensaje y un botón de reintento', () => {
    const element = container();
    const retry = vi.fn();
    renderError(element, 'No se pudo cargar el clima', retry);

    expect(element.querySelector('.status__error')?.textContent).toContain(
      'No se pudo cargar el clima',
    );

    const button = element.querySelector<HTMLButtonElement>('.status__retry');
    expect(button?.textContent).toBe('REINTENTAR');
    button?.click();
    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe('renderNotice', () => {
  it('muestra el aviso sin botón', () => {
    const element = container();
    renderNotice(element, 'Ubicación de ejemplo · Málaga');

    expect(element.querySelector('.status__notice')?.textContent).toContain(
      'Ubicación de ejemplo · Málaga',
    );
    expect(element.querySelector('.status__retry')).toBeNull();
  });

  it('añade un reintento cuando se pide', () => {
    const element = container();
    const retry = vi.fn();
    renderNotice(element, 'No se pudo actualizar', { retry });

    const button = element.querySelector<HTMLButtonElement>('.status__retry');
    expect(button).not.toBeNull();
    button?.click();
    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe('clearStatus', () => {
  it('vacía el contenedor', () => {
    const element = container();
    renderError(element, 'Error', () => undefined);
    clearStatus(element);
    expect(element.childElementCount).toBe(0);
  });
});
