'use client';

import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { PlayerNameplate } from './PlayerNameplate';
import { playLowTimeTick } from '@/lib/audio/sfx';
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
  const { clock, checkTimeout, engine, status, timeControlMs } = useGameStore();
  const lastTickedSecond = useRef<number | null>(null);
  const isActive = engine.turn === color && status !== 'checkmate' && status !== 'stalemate';
  const hasTimeLimit = timeControlMs !== null;

  // The "banked" time as of the start of the current turn (authoritative,
  // set by the store whenever a move commits — see gameStore.ts playMove).
  const bankedMs = color === 'w' ? clock.whiteMs : clock.blackMs;

  // The LIVE displayed value, recomputed fresh from real timestamps every
  // tick — bankedMs minus time elapsed since activeSince — rather than an
  // accumulated running total. This is what makes it correct even after a
  // long synchronous block (the AI's minimax search freezing the main
  // thread for a second or more): whenever this effect DOES get to run
  // again, it recalculates from `Date.now()` directly, so it always shows
  // (and the store always deducts) the true elapsed time — nothing can be
  // silently lost the way an accumulating interval could when torn down
  // mid-block before its final catch-up tick fires.
  const [liveMs, setLiveMs] = useState(bankedMs);

  useEffect(() => {
    if (!isActive || !hasTimeLimit) {
      setLiveMs(bankedMs);
      return;
    }
    lastTickedSecond.current = null; // fresh guard each time this clock starts a turn

    function update() {
      const activeSince = useGameStore.getState().clock.activeSince;
      const elapsed = activeSince ? Date.now() - activeSince : 0;
      setLiveMs(Math.max(0, bankedMs - elapsed));
      checkTimeout();
    }

    update();
    const interval = setInterval(update, 250);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, hasTimeLimit, bankedMs, checkTimeout]);

  const isLow = hasTimeLimit && liveMs < 30_000;
  const wholeSeconds = Math.ceil(liveMs / 1000);

  // Urgent tick for the final 10 seconds — once per whole second, not once
  // per 250ms polling interval, so it reads as a countdown rather than a
  // buzz.
  useEffect(() => {
    if (!isActive || !hasTimeLimit) return;
    if (wholeSeconds <= 10 && wholeSeconds > 0 && lastTickedSecond.current !== wholeSeconds) {
      lastTickedSecond.current = wholeSeconds;
      playLowTimeTick();
    }
  }, [wholeSeconds, isActive, hasTimeLimit]);

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
        {hasTimeLimit ? formatMs(liveMs) : '∞'}
      </span>
    </div>
  );
}
