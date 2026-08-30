'use client';

import { useEffect, useState, useRef } from 'react';
import type { Square } from 'chess.js';
import { useGameStore } from '@/lib/store/gameStore';
import {
  getRealtimeProvider,
  releaseRealtimeProvider,
  type RealtimeStatus,
  type IdentityPayload
} from '@/lib/realtime/provider';
import { ChessBoard } from './ChessBoard';
import { ChessSidebar } from './ChessSidebar';
import { ChatBox } from './ChatBox';
import { WifiOff, Wifi, Loader2, Eye } from 'lucide-react';

export type SeatRole = 'w' | 'b' | 'spectator';

interface OnlineGameProps {
  gameId: string;
  playerId: string;
  playerName: string;
  /** 'w' or 'b' for an actual player; 'spectator' for read-only watching. */
  role: SeatRole;
}

const STATUS_COPY: Record<RealtimeStatus, { label: string; tone: string }> = {
  connected: { label: 'Live — connected', tone: 'text-emerald-400' },
  connecting: { label: 'Connecting…', tone: 'text-gold-400' },
  disconnected: { label: 'Terputus — mencoba lagi', tone: 'text-red-400' },
  unconfigured: {
    label: 'Realtime belum dikonfigurasi — mode pratinjau lokal',
    tone: 'text-parchment-300/70'
  }
};

const DEFAULT_WHITE_NAME = 'Menunggu Putih…';
const DEFAULT_BLACK_NAME = 'Menunggu Hitam…';

export function OnlineGame({ gameId, playerId, playerName, role }: OnlineGameProps) {
  const { resetGame, playMove, engine } = useGameStore();
  const [status, setStatus] = useState<RealtimeStatus>('connecting');
  const [whiteName, setWhiteName] = useState(role === 'w' ? playerName : DEFAULT_WHITE_NAME);
  const [blackName, setBlackName] = useState(role === 'b' ? playerName : DEFAULT_BLACK_NAME);
  const provider = getRealtimeProvider(gameId);
  const repliedToPeers = useRef<Set<string>>(new Set());

  useEffect(() => {
    resetGame('online');
    let cancelled = false;

    const unsubscribeStatus = provider.onStatusChange((s) => {
      if (cancelled) return;
      setStatus(s);
      // Once connected, announce who we are — and re-announce if we
      // reconnect after a drop, so a returning opponent sees our name again.
      if (s === 'connected' && role !== 'spectator') {
        provider.sendIdentity({ playerId, name: playerName, role });
      }
    });

    const unsubscribeIdentity = provider.onIdentity((identity: IdentityPayload) => {
      if (identity.playerId === playerId) return; // ignore our own broadcast

      if (identity.role === 'w') setWhiteName(identity.name);
      if (identity.role === 'b') setBlackName(identity.name);

      // Reply with our own identity the first time we hear from a given
      // peer, so whichever side joined/reconnected later still learns who
      // was already in the room. Tracked per-peer (not a single flag) so
      // this keeps working across reconnects and multiple spectators.
      if (role !== 'spectator' && !repliedToPeers.current.has(identity.playerId)) {
        repliedToPeers.current.add(identity.playerId);
        provider.sendIdentity({ playerId, name: playerName, role });
      }
    });

    const unsubscribeMove = provider.onMove((payload) => {
      if (payload.movedBy === playerId) return;
      playMove(payload.from as Square, payload.to as Square, payload.promotion as any);
    });

    provider.connect(gameId, playerId).then(() => {
      if (cancelled) return;
      setStatus(provider.status());
    });

    return () => {
      cancelled = true;
      unsubscribeStatus();
      unsubscribeIdentity();
      unsubscribeMove();
      provider.disconnect();
      releaseRealtimeProvider(gameId);
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

  const isPlayer = role === 'w' || role === 'b';
  const isMyTurn = isPlayer && engine.turn === role;
  const isConnected = status === 'connected';
  const copy = STATUS_COPY[status];
  const orientation = role === 'b' ? 'black' : 'white';

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className={`flex items-center gap-2 text-sm ${copy.tone}`}>
        {role === 'spectator' && <Eye size={16} className="text-gold-400" />}
        {status === 'connected' && <Wifi size={16} />}
        {status === 'connecting' && <Loader2 size={16} className="animate-spin" />}
        {(status === 'disconnected' || status === 'unconfigured') && <WifiOff size={16} />}
        {copy.label}
        {role === 'spectator' && isConnected && (
          <span className="text-parchment-300/70">· Mode Penonton</span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full">
        <ChessBoard
          orientation={orientation}
          onMoveCommitted={handleMoveCommitted}
          locked={role === 'spectator' || !isMyTurn || !isConnected}
        />
        <ChessSidebar whiteName={whiteName} blackName={blackName} youAre={isPlayer ? role : null}>
          <ChatBox
            provider={provider}
            gameId={gameId}
            senderId={playerId}
            senderName={playerName}
            disabled={!isConnected}
          />
        </ChessSidebar>
      </div>
    </div>
  );
}
