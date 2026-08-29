'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, MonitorSmartphone } from 'lucide-react';

type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'royal64:theme';

const OPTIONS: Array<{ key: ThemeMode; label: string; icon: React.ReactNode }> = [
  { key: 'light', label: 'Light', icon: <Sun size={16} /> },
  { key: 'dark', label: 'Dark', icon: <Moon size={16} /> },
  { key: 'system', label: 'System', icon: <MonitorSmartphone size={16} /> }
];

export function ThemeSelector() {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored) setMode(stored);
  }, []);

  function applyTheme(next: ThemeMode) {
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next);
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = next === 'system' ? (prefersDark ? 'dark' : 'light') : next;
    root.dataset.theme = resolved;
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="font-display text-2xl text-parchment-100 mb-4">Theme</h2>
      <div className="inline-flex bg-espresso-900/60 border border-walnut-700 rounded-full p-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => applyTheme(opt.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
              mode === opt.key
                ? 'bg-gold-500 text-espresso-950'
                : 'text-parchment-200 hover:text-gold-400'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>
    </section>
  );
}
