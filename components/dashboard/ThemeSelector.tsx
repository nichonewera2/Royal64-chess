'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, MonitorSmartphone } from 'lucide-react';

type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'royal64:theme';

const OPTIONS: Array<{ key: ThemeMode; label: string; icon: React.ReactNode }> = [
  { key: 'light', label: 'Terang', icon: <Sun size={16} /> },
  { key: 'dark', label: 'Gelap', icon: <Moon size={16} /> },
  { key: 'system', label: 'Sistem', icon: <MonitorSmartphone size={16} /> }
];

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

function applyToDom(mode: ThemeMode) {
  document.documentElement.dataset.theme = resolveTheme(mode);
}

export function ThemeSelector() {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? 'dark';
    setMode(stored);
    // The inline script in app/layout.tsx already applied this before
    // paint — this call just keeps the two in sync in case the stored
    // value ever gets out of step (e.g. edited manually in devtools).
    applyToDom(stored);

    if (stored !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyToDom('system');
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  function selectTheme(next: ThemeMode) {
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyToDom(next);
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="font-display text-2xl chrome-text mb-1">Tema</h2>
      <p className="text-sm chrome-text-muted mb-4">
        Mengubah tampilan dasbor dan portal. Papan catur tetap bernuansa kayu klasik
        di kedua tema — seperti set catur kayu asli yang warnanya tidak berubah
        walau lampu ruangan berbeda.
      </p>
      <div className="inline-flex chrome-bg-elevated border chrome-border rounded-full p-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => selectTheme(opt.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
              mode === opt.key ? 'bg-gold-500 text-espresso-950' : 'chrome-text hover:text-gold-400'
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
