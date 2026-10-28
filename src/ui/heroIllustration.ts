import type { WeatherFamily } from '../domain/types';

const SVG_NS = 'http://www.w3.org/2000/svg';

const CLOUD_PATH =
  'M78 268 L78 246 C78 222 97 203 121 203 C128 168 158 144 194 144 C233 144 264 172 268 210 C292 212 310 232 310 254 L310 268 Z';

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => XML_ESCAPES[character] ?? character);
}

function sun(isDay: boolean, cx = 200, cy = 160, radius = 128): string {
  return `<circle class="hero__sun" cx="${cx}" cy="${cy}" r="${radius}" fill="${
    isDay ? 'var(--coral)' : 'var(--ink)'
  }"/>`;
}

function cloud(fill: string, stroke = 'none', strokeWidth = 0): string {
  return `<path class="hero__cloud" d="${CLOUD_PATH}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
}

function reflectionLines(color: string): string {
  return Array.from({ length: 11 }, (_, index) => {
    const y = 316 + index * 5;
    const inset = 56 + index * 8;
    const opacity = Math.max(0.08, 0.55 - index * 0.045).toFixed(2);
    return `<line class="hero__line" x1="${inset}" y1="${y}" x2="${
      400 - inset
    }" y2="${y}" stroke="${color}" stroke-width="2" stroke-linecap="square" opacity="${opacity}"/>`;
  }).join('');
}

function stars(): string {
  const points: Array<[number, number, number]> = [
    [320, 68, 4],
    [350, 96, 3],
    [292, 98, 2.5],
    [336, 132, 2],
  ];

  return points
    .map(
      ([cx, cy, radius]) =>
        `<circle class="hero__star" cx="${cx}" cy="${cy}" r="${radius}" fill="var(--ochre)"/>`,
    )
    .join('');
}

function fogLines(): string {
  const specs: Array<[number, number, number, number]> = [
    [120, 70, 330, 0.55],
    [150, 46, 354, 0.48],
    [180, 88, 312, 0.42],
    [210, 58, 342, 0.36],
    [240, 100, 300, 0.3],
    [270, 64, 336, 0.24],
    [300, 112, 288, 0.18],
  ];

  return specs
    .map(
      ([y, x1, x2, opacity]) =>
        `<line class="hero__line" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="var(--ink)" stroke-width="3" stroke-linecap="square" opacity="${opacity}"/>`,
    )
    .join('');
}

function rainDrops(drizzle: boolean): string {
  const specs: Array<[number, number]> = drizzle
    ? [
        [122, 22],
        [156, 30],
        [190, 18],
        [226, 28],
        [260, 22],
        [294, 30],
      ]
    : [
        [122, 58],
        [156, 74],
        [190, 48],
        [226, 68],
        [260, 54],
        [294, 76],
      ];

  return specs
    .map(
      ([x, length], index) =>
        `<line class="hero__drop" x1="${x}" y1="294" x2="${x}" y2="${
          294 + length
        }" stroke="${index % 2 === 0 ? 'var(--coral)' : 'var(--ochre-deep)'}" stroke-width="5" stroke-linecap="square"/>`,
    )
    .join('');
}

function snowFlakes(): string {
  const points: Array<[number, number]> = [
    [118, 305],
    [168, 332],
    [222, 302],
    [272, 328],
    [312, 300],
    [196, 356],
  ];

  return points
    .map(
      ([x, y]) =>
        `<g class="hero__flake" stroke="var(--ink)" stroke-width="2" stroke-linecap="square"><line x1="${
          x - 8
        }" y1="${y}" x2="${x + 8}" y2="${y}"/><line x1="${x}" y1="${
          y - 8
        }" x2="${x}" y2="${y + 8}"/><line x1="${x - 6}" y1="${y - 6}" x2="${
          x + 6
        }" y2="${y + 6}"/><line x1="${x - 6}" y1="${y + 6}" x2="${
          x + 6
        }" y2="${y - 6}"/></g>`,
    )
    .join('');
}

function artFor(family: WeatherFamily, isDay: boolean): string {
  switch (family) {
    case 'clear':
      return `${sun(isDay)}${reflectionLines(
        isDay ? 'var(--ink)' : 'var(--ochre)',
      )}${isDay ? '' : stars()}`;
    case 'partly':
      return `${sun(isDay, 148, 152, 104)}${
        isDay
          ? cloud('var(--ink)')
          : cloud('var(--paper)', 'var(--ink)', 3)
      }${reflectionLines(isDay ? 'var(--ink)' : 'var(--ochre)')}${
        isDay ? '' : stars()
      }`;
    case 'cloudy':
      return `<g transform="translate(42 -38) scale(.9)">${cloud(
        'var(--ink)',
        'none',
        0,
      )}</g><g transform="translate(-14 20) scale(.86)">${cloud(
        'var(--paper)',
        'var(--ink)',
        3,
      )}</g><g transform="translate(224 18) scale(.52)">${cloud(
        'var(--ink)',
      )}</g>`;
    case 'fog':
      return fogLines();
    case 'drizzle':
      return `${cloud('var(--ink)')}${rainDrops(true)}`;
    case 'rain':
      return `${cloud('var(--ink)')}${rainDrops(false)}`;
    case 'snow':
      return `${cloud('var(--ink)')}${snowFlakes()}`;
    case 'storm':
      return `${cloud('var(--ink)')}<path class="hero__bolt" d="M214 266 L180 334 L210 334 L194 398 L252 310 L220 310 L242 266 Z" fill="var(--ochre)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="miter"/>`;
  }
}

function buildHeroSvg(
  family: WeatherFamily,
  isDay: boolean,
  description?: string,
): string {
  const variant = isDay ? 'day' : 'night';
  const title = description === undefined ? '' : escapeXml(description);

  return `<svg xmlns="${SVG_NS}" class="hero__svg" viewBox="0 0 400 400" role="img" aria-hidden="true" data-family="${family}" data-variant="${variant}"><title>${title}</title>${artFor(
    family,
    isDay,
  )}</svg>`;
}

export function heroIllustration(
  family: WeatherFamily,
  isDay: boolean,
  description: string,
): string {
  return buildHeroSvg(family, isDay, description);
}

export function renderHero(
  container: HTMLElement,
  family: WeatherFamily,
  isDay: boolean,
  description: string,
): void {
  const template = document.createElement('template');
  template.innerHTML = buildHeroSvg(family, isDay);

  const svg = template.content.querySelector('svg');
  if (svg) {
    const title = svg.querySelector('title');
    if (title) {
      title.textContent = description;
    }
  }

  const word = document.createElement('span');
  word.className = 'hero__word';
  word.textContent = description.toUpperCase();
  word.setAttribute('aria-hidden', 'true');

  if (svg) {
    container.replaceChildren(svg, word);
  } else {
    container.replaceChildren(word);
  }
}
