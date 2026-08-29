'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import clsx from 'clsx';

function formatMs(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

interface ChessClockProps {
  color: 'w' | 'b';
  label: string;
}

export function ChessClock({ color, label }: ChessClockProps) {
  const { clock, tickClock, engine, status } = useGameStore();
  const lastTick = useRef<number>(Date.now());
  const isActive = engine.turn === color && status !== 'checkmate' && status !== 'stalemate';

  useEffect(() => {
    if (!isActive) return;
    lastTick.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTick.current;
      lastTick.current = now;
      tickClock(color, delta);
    }, 250);
    return () => clearInterval(interval);
  }, [isActive, color, tickClock]);

  const ms = color === 'w' ? clock.whiteMs : clock.blackMs;
  const isLow = ms < 30_000;

  return (
    <div
      className={clsx(
        'flex items-center justify-between px-4 py-2 rounded-lg font-mono text-xl tabular-nums border',
        isActive
          ? 'bg-mahogany-600/90 border-gold-500 text-ivory'
          : 'bg-espresso-800/60 border-walnut-700 text-parchment-300',
        isLow && 'text-red-300 border-red-400 animate-pulse'
      )}
    >
      <span className="font-body text-xs uppercase tracking-wide opacity-80">{label}</span>
      <span>{formatMs(ms)}</span>
    </div>
  );
}
