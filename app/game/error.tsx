'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { useGameStore } from '@/lib/store/gameStore';

export default function GameSegmentError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const resetGame = useGameStore((s) => s.resetGame);

  useEffect(() => {
    console.error('Royal64 chess engine error:', error);
  }, [error]);

  function handleRecover() {
    resetGame('local');
    reset();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-espresso-950 px-6 text-center">
      <div className="max-w-sm">
        <ShieldAlert className="mx-auto mb-4 text-mahogany-500" size={36} />
        <h1 className="font-display text-2xl text-parchment-100 mb-2">
          The chess engine stumbled
        </h1>
        <p className="text-parchment-300/70 mb-6">
          Something went wrong mid-game. This is isolated to the board — the
          rest of Royal64 is unaffected. Starting a fresh game will clear it.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleRecover}
            className="bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium px-5 py-2.5 rounded-lg"
          >
            Start Fresh Game
          </button>
          <Link href="/dashboard" className="text-parchment-300/70 underline text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
