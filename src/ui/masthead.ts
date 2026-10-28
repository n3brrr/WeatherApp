import { formatPlaceDate } from '../domain/format';
import type { Place } from '../domain/types';

export interface MastheadData {
  place: Place;
  today: string;
  coordinates: string;
  notice?: string;
}

function brand(): HTMLSpanElement {
  const element = document.createElement('span');
  element.className = 'masthead__brand';
  element.textContent = 'WEATHER APP';
  return element;
}

export function renderMasthead(container: HTMLElement, data: MastheadData): void {
  const inner = document.createElement('div');
  inner.className = 'masthead__inner';

  const placeGroup = document.createElement('div');
  placeGroup.className = 'masthead__place-group';

  const name = document.createElement('p');
  name.className = 'masthead__place';
  name.textContent = data.place.name;
  name.title = data.place.name;

  const meta = document.createElement('p');
  meta.className = 'masthead__meta';

  const date = document.createElement('time');
  date.className = 'masthead__date';
  date.dateTime = data.today;
  date.textContent = formatPlaceDate(data.today);
  meta.append(date);

  placeGroup.append(name, meta);

  if (data.notice) {
    const notice = document.createElement('p');
    notice.className = 'masthead__notice';
    notice.textContent = data.notice;
    placeGroup.append(notice);
  }

  const coordinates = document.createElement('span');
  coordinates.className = 'masthead__coords';
  coordinates.textContent = data.coordinates;

  inner.append(brand(), placeGroup, coordinates);
  container.replaceChildren(inner);
}

export function renderMastheadLoading(container: HTMLElement): void {
  const inner = document.createElement('div');
  inner.className = 'masthead__inner';

  const placeGroup = document.createElement('div');
  placeGroup.className = 'masthead__place-group';

  const placeholder = document.createElement('p');
  placeholder.className = 'masthead__place masthead__place--loading';
  placeholder.textContent = 'UBICACIÓN…';

  placeGroup.append(placeholder);
  inner.append(brand(), placeGroup);
  container.replaceChildren(inner);
}
