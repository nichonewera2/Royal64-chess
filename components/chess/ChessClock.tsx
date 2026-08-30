'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { PlayerNameplate } from './PlayerNameplate';
import clsx from 'clsx';

function formatMs(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

interface ChessClockProps {
  color: 'w' | 'b';
  name: string;
  isYou?: boolean;
}

export function ChessClock({ color, name, isYou }: ChessClockProps) {
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
        "flex items-center justify-between px-4 py-2.5 rounded-lg border bg-[url('/textures/wood-grain.svg')] bg-cover",
        isActive ? 'border-gold-500 shadow-[0_0_0_1px_rgba(201,162,75,0.4)]' : 'border-walnut-700/60'
      )}
    >
      <PlayerNameplate name={name} color={color} isActive={isActive} isYou={isYou} />
      <span
        className={clsx(
          'font-mono text-xl tabular-nums',
          isActive ? 'text-ivory' : 'text-parchment-300/70',
          isLow && 'text-red-300 animate-pulse'
        )}
      >
        {formatMs(ms)}
      </span>
    </div>
  );
}
