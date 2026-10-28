const DIAS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'] as const;
const MESES = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
] as const;

function parseISODate(isoDate: string): [year: number, month: number, day: number] {
  const [year = '1970', month = '1', day = '1'] = isoDate.split('-');
  return [Number(year), Number(month), Number(day)];
}

function getIntlParts(date: Date, timeZone: string, options: Intl.DateTimeFormatOptions) {
  const parts = new Intl.DateTimeFormat('en-GB', { ...options, timeZone }).formatToParts(date);
  const find = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return find;
}

export function formatTemperature(value: number): string {
  return `${Math.round(value)}°`;
}

export function formatTemperatureWithUnit(value: number): string {
  return `${Math.round(value)}°C`;
}

export function formatWind(value: number): string {
  return `${Math.round(value)} km/h`;
}

export function formatHumidity(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatCoordinates(latitude: number, longitude: number): string {
  const latHemisphere = latitude >= 0 ? 'N' : 'S';
  const lonHemisphere = longitude >= 0 ? 'E' : 'O';
  return `${Math.abs(latitude).toFixed(2)}° ${latHemisphere} · ${Math.abs(longitude).toFixed(
    2,
  )}° ${lonHemisphere}`;
}

export function getDateInTimeZone(date: Date, timeZone: string): string {
  const find = getIntlParts(date, timeZone, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return `${find('year')}-${find('month')}-${find('day')}`;
}

export function formatPlaceDate(isoDate: string): string {
  const [year, month, day] = parseISODate(isoDate);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${DIAS[weekday] ?? '---'}, ${String(day).padStart(2, '0')} ${
    MESES[month - 1] ?? '---'
  }`;
}

export function formatDayLabel(isoDate: string, today: string): string {
  if (isoDate === today) {
    return 'HOY';
  }
  const [year, month, day] = parseISODate(isoDate);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return DIAS[weekday] ?? '---';
}

export function formatHourLabel(isoDateTime: string): string {
  return isoDateTime.slice(11, 16);
}

export function formatUpdatedAt(date: Date, timeZone: string): string {
  const find = getIntlParts(date, timeZone, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  return `${find('hour')}:${find('minute')}`;
}

export function getTodayDate(currentTime: string): string {
  return currentTime.slice(0, 10);
}
