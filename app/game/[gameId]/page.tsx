'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { isValidGameId } from '@/lib/chess/gameId';
import { OnlineGame } from '@/components/chess/OnlineGame';
import { useToastStore } from '@/components/ui/Toast';

export default function GameRoomPage() {
  const params = useParams<{ gameId: string }>();
  const router = useRouter();
  const push = useToastStore((s) => s.push);
  const [playerId] = useState(() => `player-${Math.random().toString(36).slice(2, 9)}`);

  const gameId = decodeURIComponent(params.gameId ?? '').toUpperCase();
  const valid = isValidGameId(gameId);

  useEffect(() => {
    if (!valid) {
      push('That game could not be found.', 'error');
    }
  }, [valid, push]);

  if (!valid) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-espresso-950 px-6">
        <div className="text-center max-w-sm">
          <h1 className="font-display text-2xl text-parchment-100 mb-2">
            That game could not be found.
          </h1>
          <p className="text-parchment-300/70 mb-6">
            Double-check the Game ID, or ask your opponent to re-share the QR code.
          </p>
          <Link href="/game" className="text-gold-400 underline">
            Back to Game Portal
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-espresso-950 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/game')} className="text-parchment-300/70 hover:text-gold-400">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-2xl text-parchment-100">
            Room <span className="text-gold-400 font-mono">{gameId}</span>
          </h1>
        </div>
        <OnlineGame gameId={gameId} playerId={playerId} playerColor="w" />
      </div>
    </main>
  );
}
