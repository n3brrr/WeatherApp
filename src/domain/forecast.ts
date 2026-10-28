import type { DailyPoint, HourlyPoint } from './types';

export function getNextHours(
  hourly: HourlyPoint[],
  currentTime: string,
  count = 8,
): HourlyPoint[] {
  const target = `${currentTime.slice(0, 13)}:00`;
  let start = hourly.findIndex((point) => point.time === target);

  if (start === -1) {
    start = hourly.findIndex((point) => point.time >= target);
  }

  if (start === -1) {
    start = 0;
  }

  return hourly.slice(start, start + count);
}

export function getDisplayDays(daily: DailyPoint[], count = 6): DailyPoint[] {
  return daily.slice(0, count);
}
