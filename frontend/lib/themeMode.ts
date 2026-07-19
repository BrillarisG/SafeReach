'use client';

export const THEME_STORAGE_KEY = 'safereach_theme_mode';

export type ThemeMode = 'light' | 'dark';

export function applyThemeMode(mode: ThemeMode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  document.documentElement.dataset.theme = mode;
}

export function readThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

export function saveThemeMode(mode: ThemeMode) {
  window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  applyThemeMode(mode);
}
