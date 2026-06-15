'use client';

export function dailyResetKey(prefix: string) {
  const now = new Date();
  const reset = new Date(now);
  reset.setHours(8, 0, 0, 0);
  if (now < reset) reset.setDate(reset.getDate() - 1);
  return `${prefix}_${reset.toISOString().slice(0, 10)}`;
}

export function readDailyIds(prefix: string) {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(dailyResetKey(prefix)) ?? '[]') as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeDailyIds(prefix: string, ids: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(dailyResetKey(prefix), JSON.stringify(Array.from(new Set(ids))));
}
