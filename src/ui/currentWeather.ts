import { formatHumidity, formatTemperature, formatWind } from '../domain/format';
import type { WeatherCondition, WeatherData } from '../domain/types';
import { metricIcon, type MetricIcon } from './icons';

function metric(
  kind: MetricIcon,
  label: string,
  value: string,
  valueClass: string,
): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'current__metric';

  const term = document.createElement('dt');
  term.className = 'current__metric-label';

  const icon = document.createElement('span');
  icon.className = 'current__metric-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = metricIcon(kind);

  term.append(icon, document.createTextNode(label));

  const description = document.createElement('dd');
  description.className = valueClass;
  description.textContent = value;

  wrapper.append(term, description);
  return wrapper;
}

export function renderCurrentWeather(
  container: HTMLElement,
  data: WeatherData,
  condition: WeatherCondition,
): void {
  const heading = document.createElement('h1');
  heading.className = 'current__temperature';
  heading.setAttribute(
    'aria-label',
    `${Math.round(data.current.temperature)} grados Celsius`,
  );

  const temperature = document.createElement('span');
  temperature.className = 'current__temp';
  temperature.textContent = formatTemperature(data.current.temperature);
  temperature.setAttribute('aria-hidden', 'true');

  const unit = document.createElement('span');
  unit.className = 'current__unit';
  unit.textContent = 'C';
  unit.setAttribute('aria-hidden', 'true');

  heading.append(temperature, unit);

  const description = document.createElement('p');
  description.className = 'current__description';
  description.textContent = condition.description;

  const minimum = data.daily[0]?.min ?? data.current.temperature;

  const metrics = document.createElement('dl');
  metrics.className = 'current__metrics';
  metrics.append(
    metric('wind', 'VIENTO', formatWind(data.current.windSpeed), 'current__wind'),
    metric('humidity', 'HUMEDAD', formatHumidity(data.current.humidity), 'current__humidity'),
    metric('min', 'MÍNIMA', formatTemperature(minimum), 'current__min'),
  );

  container.replaceChildren(heading, description, metrics);
}
