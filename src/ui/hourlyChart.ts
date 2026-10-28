import { formatHourLabel, formatTemperature } from '../domain/format';
import type { HourlyPoint } from '../domain/types';

const SVG_NS = 'http://www.w3.org/2000/svg';
const VIEW_WIDTH = 800;
const VIEW_HEIGHT = 140;
const PAD_LEFT = 48;
const PAD_RIGHT = 752;
const CHART_TOP = 24;
const CHART_BOTTOM = 84;
const BASELINE_Y = 100;
const TIME_LABEL_Y = 126;

interface PlotPoint {
  x: number;
  y: number;
}

function svgElement(
  tag: string,
  attributes: Record<string, string | number>,
): SVGElement {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }
  return element;
}

function smoothPath(points: PlotPoint[]): string {
  const first = points[0];
  if (!first) {
    return '';
  }

  let path = `M ${first.x} ${first.y}`;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    if (!previous || !current) {
      continue;
    }
    const middleX = (previous.x + current.x) / 2;
    path += ` C ${middleX} ${previous.y}, ${middleX} ${current.y}, ${current.x} ${current.y}`;
  }

  return path;
}

export function renderHourlyChart(container: HTMLElement, hours: HourlyPoint[]): void {
  const points = hours.slice(0, 8);
  const label = document.createElement('h2');
  label.className = 'hourly__label';
  label.textContent = 'PRÓXIMAS 8 HORAS';

  const scroll = document.createElement('div');
  scroll.className = 'hourly__scroll';

  const svg = svgElement('svg', {
    class: 'hourly__chart',
    viewBox: `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`,
    role: 'img',
  });

  const title = svgElement('title', {});
  title.textContent = `Próximas ${points.length} horas`;
  svg.append(title);

  svg.append(
    svgElement('line', {
      class: 'hourly__rule',
      x1: PAD_LEFT,
      y1: CHART_TOP,
      x2: PAD_RIGHT,
      y2: CHART_TOP,
    }),
    svgElement('line', {
      class: 'hourly__rule',
      x1: PAD_LEFT,
      y1: 54,
      x2: PAD_RIGHT,
      y2: 54,
    }),
    svgElement('line', {
      class: 'hourly__baseline',
      x1: PAD_LEFT,
      y1: BASELINE_Y,
      x2: PAD_RIGHT,
      y2: BASELINE_Y,
    }),
  );

  if (points.length > 0) {
    const temperatures = points.map((point) => point.temperature);
    const minimum = Math.min(...temperatures);
    const maximum = Math.max(...temperatures);
    const range = maximum - minimum || 1;
    const step = points.length > 1 ? (PAD_RIGHT - PAD_LEFT) / (points.length - 1) : 0;

    const plot: PlotPoint[] = points.map((point, index) => ({
      x: points.length > 1 ? PAD_LEFT + index * step : (PAD_LEFT + PAD_RIGHT) / 2,
      y: CHART_BOTTOM - ((point.temperature - minimum) / range) * (CHART_BOTTOM - CHART_TOP),
    }));

    const path = svgElement('path', {
      class: 'hourly__line',
      d: smoothPath(plot),
      pathLength: 1,
    });
    svg.append(path);

    points.forEach((point, index) => {
      const position = plot[index];
      if (!position) {
        return;
      }

      const dot = svgElement('circle', {
        class: index === 0 ? 'hourly__dot hourly__dot--now' : 'hourly__dot',
        cx: position.x,
        cy: position.y,
        r: index === 0 ? 4 : 3,
      });
      svg.append(dot);

      const temperature = svgElement('text', {
        class: 'hourly__temp',
        x: position.x,
        y: position.y - 9,
        'text-anchor': 'middle',
      });
      temperature.textContent = formatTemperature(point.temperature);
      svg.append(temperature);

      const time = svgElement('text', {
        class: 'hourly__time',
        x: position.x,
        y: TIME_LABEL_Y,
        'text-anchor': 'middle',
      });
      time.textContent = formatHourLabel(point.time);
      svg.append(time);
    });
  }

  scroll.append(svg);
  container.replaceChildren(label, scroll);
}
