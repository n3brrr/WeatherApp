import { formatDayLabel, formatTemperature } from '../domain/format';
import { getWeatherCondition } from '../domain/weatherCodes';
import type { DailyPoint } from '../domain/types';
import { weatherIcon } from './icons';

export function renderDailyForecast(
  container: HTMLElement,
  days: DailyPoint[],
  today: string,
): void {
  const label = document.createElement('h2');
  label.className = 'daily__label';
  label.textContent = 'PRÓXIMOS DÍAS';

  const list = document.createElement('ol');
  list.className = 'daily__list';

  for (const day of days.slice(0, 6)) {
    const condition = getWeatherCondition(day.weatherCode);

    const row = document.createElement('li');
    row.className = 'daily__row';

    const time = document.createElement('time');
    time.className = 'daily__day';
    time.dateTime = day.date;
    time.textContent = formatDayLabel(day.date, today);

    const icon = document.createElement('span');
    icon.className = 'daily__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = weatherIcon(condition.family, true, 28);

    const temperatures = document.createElement('span');
    temperatures.className = 'daily__temps';
    temperatures.setAttribute(
      'aria-label',
      `Máxima ${Math.round(day.max)} grados, mínima ${Math.round(day.min)} grados`,
    );

    const max = document.createElement('span');
    max.className = 'daily__max';
    max.textContent = formatTemperature(day.max);
    max.setAttribute('aria-hidden', 'true');

    const min = document.createElement('span');
    min.className = 'daily__min';
    min.textContent = formatTemperature(day.min);
    min.setAttribute('aria-hidden', 'true');

    temperatures.append(max, min);
    row.append(time, icon, temperatures);
    list.append(row);
  }

  container.replaceChildren(label, list);
}
