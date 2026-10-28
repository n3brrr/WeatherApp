import type { WeatherFamily } from '../domain/types';

export type MetricIcon = 'wind' | 'humidity' | 'min';

function cloudPath(): string {
  return 'M5 19h11a3 3 0 0 0 .3-6 4.5 4.5 0 0 0-8.7-1A3.5 3.5 0 0 0 5 19Z';
}

function familyShapes(family: WeatherFamily, isDay: boolean): string {
  switch (family) {
    case 'clear':
      return isDay
        ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>'
        : '<path d="M19.5 14.6A7.5 7.5 0 0 1 9.4 4.5 8 8 0 1 0 19.5 14.6Z"/>';
    case 'partly':
      return isDay
        ? '<circle cx="8.5" cy="8.5" r="2.5"/><path d="M8.5 3v1.5M8.5 12.5V14M3 8.5h1.5M12.5 8.5H14"/>' +
            `<path d="${cloudPath()}"/>`
        : '<path d="M17.5 11.4A5.5 5.5 0 0 1 10.6 4 5.8 5.8 0 1 0 17.5 11.4Z"/>' +
            `<path d="${cloudPath()}"/>`;
    case 'cloudy':
      return '<path d="M3 14h9a2.5 2.5 0 0 0 .2-5 3.8 3.8 0 0 0-7.1-.8A3 3 0 0 0 3 14Z"/>' +
        '<path d="M11 20h7a2.2 2.2 0 0 0 .1-4.4 3.3 3.3 0 0 0-6.3-.7A2.6 2.6 0 0 0 11 20Z"/>';
    case 'fog':
      return '<path d="M4 8h16M7 12h13M3 16h14M8 20h9"/>';
    case 'drizzle':
      return `<path d="${cloudPath()}"/><path d="M8 20v1.5M12 20v2M16 20v1.5"/>`;
    case 'rain':
      return `<path d="${cloudPath()}"/><path d="M8 20v3M12 20v4M16 20v3"/>`;
    case 'snow':
      return `<path d="${cloudPath()}"/><path d="M8 19.5v3M6.5 21h3M12 20.5v3M10.5 22h3M16 19.5v3M14.5 21h3"/>`;
    case 'storm':
      return `<path d="${cloudPath()}"/><path d="M12 15l-2 4h2.5L11 23l4.5-5h-2.5L15 15Z"/>`;
  }
}

export function weatherIcon(family: WeatherFamily, isDay: boolean, size = 24): string {
  const variant = isDay ? 'day' : 'night';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false" data-family="${family}" data-variant="${variant}">${familyShapes(
    family,
    isDay,
  )}</svg>`;
}

export function metricIcon(kind: MetricIcon): string {
  const shapes: Record<MetricIcon, string> = {
    wind: '<path d="M3 8h11a2 2 0 1 0-2-2M3 12h15a2 2 0 1 1-2 2M3 16h8"/>',
    humidity:
      '<path d="M12 3s5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 5-9 5-9Z"/><path d="M10 14a2.5 2.5 0 0 0 2 2"/>',
    min: '<path d="M12 4v14M7 13l5 5 5-5M5 21h14"/>',
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false" data-icon="${kind}">${shapes[kind]}</svg>`;
}
