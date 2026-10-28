const SVG_NS = 'http://www.w3.org/2000/svg';

export interface RefreshControl {
  button: HTMLButtonElement;
  updated: HTMLElement;
}

function refreshIcon(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'footer__refresh-icon');
  svg.setAttribute('width', '12');
  svg.setAttribute('height', '12');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'square');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  const arc = document.createElementNS(SVG_NS, 'path');
  arc.setAttribute('d', 'M20 12a8 8 0 1 1-2.3-5.6');

  const head = document.createElementNS(SVG_NS, 'path');
  head.setAttribute('d', 'M20 3v5h-5');

  svg.append(arc, head);
  return svg;
}

export function createRefreshControl(
  container: HTMLElement,
  onRefresh: () => void,
): RefreshControl {
  const inner = document.createElement('div');
  inner.className = 'footer__inner';

  const meta = document.createElement('div');
  meta.className = 'footer__meta';

  const source = document.createElement('span');
  source.className = 'footer__source';
  source.textContent = 'OPEN-METEO';

  const updated = document.createElement('span');
  updated.className = 'footer__updated';

  meta.append(source, updated);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'footer__refresh';
  button.setAttribute('aria-label', 'Actualizar datos del clima');
  button.append(refreshIcon(), document.createTextNode('ACTUALIZAR'));
  button.addEventListener('click', onRefresh);

  inner.append(meta, button);
  container.replaceChildren(inner);

  return { button, updated };
}

export function setRefreshing(control: RefreshControl, isRefreshing: boolean): void {
  control.button.disabled = isRefreshing;
  control.button.classList.toggle('is-refreshing', isRefreshing);
}

export function setUpdatedAt(control: RefreshControl, text: string): void {
  control.updated.textContent = text;
}
