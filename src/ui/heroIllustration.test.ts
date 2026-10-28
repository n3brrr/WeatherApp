// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { heroIllustration, renderHero } from './heroIllustration';

describe('heroIllustration', () => {
  it('describe la condición y marca la familia', () => {
    const markup = heroIllustration('clear', true, 'Despejado');
    expect(markup).toContain('<title>Despejado</title>');
    expect(markup).toContain('data-family="clear"');
    expect(markup).toContain('hero__sun');
  });

  it('cambia a la variante nocturna', () => {
    expect(heroIllustration('clear', false, 'Despejado')).toContain('data-variant="night"');
  });

  it('usa símbolos propios de lluvia, tormenta y nieve', () => {
    expect(heroIllustration('rain', true, 'Lluvia')).toContain('hero__drop');
    expect(heroIllustration('drizzle', true, 'Llovizna')).toContain('hero__drop');
    expect(heroIllustration('storm', true, 'Tormenta')).toContain('hero__bolt');
    expect(heroIllustration('snow', true, 'Nieve')).toContain('hero__flake');
  });

  it('no interpreta la descripción como marcado', () => {
    const markup = heroIllustration('clear', true, '<script>alert(1)</script>');
    expect(markup).not.toContain('<script>');
    expect(markup).toContain('&lt;script&gt;');
  });
});

describe('renderHero', () => {
  it('monta el svg y la palabra vertical', () => {
    const container = document.createElement('div');
    renderHero(container, 'clear', true, 'Despejado');

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('.hero__word')?.textContent).toBe('DESPEJADO');
  });

  it('inserta la descripción como texto, no como html', () => {
    const container = document.createElement('div');
    renderHero(container, 'clear', true, '<script>alert(1)</script>');

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('title')?.textContent).toBe('<script>alert(1)</script>');
  });
});
