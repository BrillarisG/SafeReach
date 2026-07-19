'use client';

import { useEffect, useState } from 'react';
import { readThemeMode, saveThemeMode, type ThemeMode } from '@/lib/themeMode';

export default function ThemeModeToggle() {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const stored = readThemeMode();
    setMode(stored);
    saveThemeMode(stored);
  }, []);

  function toggleMode() {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    saveThemeMode(next);
  }

  return (
    <section className="bg-white rounded-xl border border-outline-variant/30 p-stack-md shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-headline-md text-primary">Display Mode</h3>
          <p className="text-label-md text-on-surface-variant">Saved for this browser on every SafeReach page.</p>
        </div>
        <button
          type="button"
          onClick={toggleMode}
          title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="group relative inline-flex h-11 w-20 items-center rounded-full border border-outline-variant bg-surface-container px-1 transition focus-visible:z-50"
        >
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm transition-transform ${mode === 'dark' ? 'translate-x-9' : 'translate-x-0'}`}>
            <span className="material-symbols-outlined text-[20px]">{mode === 'dark' ? 'dark_mode' : 'light_mode'}</span>
          </span>
          <span role="tooltip" className="safe-tooltip pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md border border-outline-variant bg-white px-2 py-1 text-xs font-bold text-on-surface shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </section>
  );
}
