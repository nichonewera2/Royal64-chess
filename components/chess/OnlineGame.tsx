'use client';

import { useEffect, useState } from 'react';
import type { Square } from 'chess.js';
import { useGameStore } from '@/lib/store/gameStore';
import { getRealtimeProvider, type RealtimeStatus } from '@/lib/realtime/provider';
import { ChessBoard } from './ChessBoard';
import { ChessSidebar } from './ChessSidebar';
import { WifiOff, Wifi, Loader2 } from 'lucide-react';

interface OnlineGameProps {
  gameId: string;
  playerId: string;
  playerColor: 'w' | 'b';
}

const STATUS_COPY: Record<RealtimeStatus, { label: string; tone: string }> = {
  connected: { label: 'Live — connected', tone: 'text-emerald-400' },
  connecting: { label: 'Connecting…', tone: 'text-gold-400' },
  disconnected: { label: "You're offline — reconnecting", tone: 'text-red-400' },
  unconfigured: {
    label: 'Realtime provider not configured — playing in local preview mode',
    tone: 'text-parchment-300/70'
  }
};

export function OnlineGame({ gameId, playerId, playerColor }: OnlineGameProps) {
  const { resetGame, playMove, engine } = useGameStore();
  const [status, setStatus] = useState<RealtimeStatus>('connecting');
  const provider = getRealtimeProvider();

  useEffect(() => {
    resetGame('online');
    provider.connect(gameId, playerId).then(() => setStatus(provider.status()));

    const unsubscribe = provider.onMove((payload) => {
      if (payload.movedBy === playerId) return;
      playMove(payload.from as Square, payload.to as Square, payload.promotion as any);
    });

    return () => {
      unsubscribe();
      provider.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  function handleMoveCommitted(from: Square, to: Square) {
    provider.sendMove({
      gameId,
      fen: engine.fen,
      from,
      to,
      movedBy: playerId,
      timestamp: Date.now()
    });
  }

  const isMyTurn = engine.turn === playerColor;
  const copy = STATUS_COPY[status];

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className={`flex items-center gap-2 text-sm ${copy.tone}`}>
        {status === 'connected' && <Wifi size={16} />}
        {status === 'connecting' && <Loader2 size={16} className="animate-spin" />}
        {(status === 'disconnected' || status === 'unconfigured') && <WifiOff size={16} />}
        {copy.label}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        <ChessBoard
          orientation={playerColor === 'w' ? 'white' : 'black'}
          onMoveCommitted={handleMoveCommitted}
          locked={!isMyTurn}
        />
        <ChessSidebar opponentLabel={`Opponent (${playerColor === 'w' ? 'Black' : 'White'})`} />
      </div>
    </div>
  );
}
