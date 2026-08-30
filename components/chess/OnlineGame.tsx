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
import { HostLobby, JoinerLobby } from './RoomLobby';
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
  connected: { label: 'Langsung — Terhubung', tone: 'text-emerald-400' },
  connecting: { label: 'Menghubungkan…', tone: 'text-gold-400' },
  disconnected: { label: 'Terputus — mencoba lagi', tone: 'text-red-400' },
  unconfigured: {
    label: 'Realtime belum dikonfigurasi — mode pratinjau lokal',
    tone: 'text-parchment-300/70'
  }
};

const DEFAULT_WHITE_NAME = 'Menunggu Putih…';
const DEFAULT_BLACK_NAME = 'Menunggu Hitam…';

export function OnlineGame({ gameId, playerId, playerName, role }: OnlineGameProps) {
  const { resetGame, playMove, engine, resign, offerDraw, respondDraw } = useGameStore();
  const [status, setStatus] = useState<RealtimeStatus>('connecting');
  const [whiteName, setWhiteName] = useState(role === 'w' ? playerName : DEFAULT_WHITE_NAME);
  const [blackName, setBlackName] = useState(role === 'b' ? playerName : DEFAULT_BLACK_NAME);
  const provider = getRealtimeProvider(gameId);
  const repliedToPeers = useRef<Set<string>>(new Set());

  // --- Waiting-room lobby state ---
  // Spectators skip the lobby entirely and just watch whatever's on the
  // board. Players (host = 'w', joiner = 'b') start in the lobby and only
  // enter the actual game once the host explicitly approves a join
  // request — both screens flip to the board at the moment that approval
  // broadcast lands, so they transition together rather than the joiner
  // guessing when they've been let in.
  const [gameStarted, setGameStarted] = useState(role === 'spectator');
  const [pendingRequests, setPendingRequests] = useState<
    Array<{ playerId: string; name: string }>
  >([]);
  const [joinStatus, setJoinStatus] = useState<'waiting' | 'declined'>('waiting');
  const hasSentJoinRequest = useRef(false);

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
      // The joiner asks to enter the room as soon as they're connected.
      // Guarded so a later reconnect doesn't spam duplicate requests.
      if (s === 'connected' && role === 'b' && !hasSentJoinRequest.current) {
        hasSentJoinRequest.current = true;
        provider.send('join-request', { playerId, name: playerName });
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

    // Resign/draw are applied locally by ChessControls for whoever acted;
    // these listeners apply the SAME action on the other player's screen,
    // since each browser holds its own independent game store.
    const unsubscribeResign = provider.on<{ by: 'w' | 'b' }>('resign', (payload) => {
      resign(payload.by);
    });
    const unsubscribeDrawOffer = provider.on<{ by: 'w' | 'b' }>('draw-offer', (payload) => {
      offerDraw(payload.by);
    });
    const unsubscribeDrawResponse = provider.on<{ accepted: boolean }>('draw-response', (payload) => {
      respondDraw(payload.accepted);
    });

    // --- Lobby event wiring ---
    // Host: collect join requests into a queue for the approval UI.
    const unsubscribeJoinRequest = provider.on<{ playerId: string; name: string }>(
      'join-request',
      (payload) => {
        if (role !== 'w') return;
        setPendingRequests((prev) =>
          prev.some((r) => r.playerId === payload.playerId) ? prev : [...prev, payload]
        );
      }
    );
    // Joiner: the host approved us — flip to the board at the same moment
    // the host does, since both sides react to this same broadcast.
    const unsubscribeJoinApproved = provider.on<{ playerId: string }>('join-approved', (payload) => {
      if (role === 'b' && payload.playerId === playerId) {
        setGameStarted(true);
      }
    });
    const unsubscribeJoinDeclined = provider.on<{ playerId: string }>('join-declined', (payload) => {
      if (role === 'b' && payload.playerId === playerId) {
        setJoinStatus('declined');
      }
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
      unsubscribeResign();
      unsubscribeDrawOffer();
      unsubscribeDrawResponse();
      unsubscribeJoinRequest();
      unsubscribeJoinApproved();
      unsubscribeJoinDeclined();
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

  function handleResignBroadcast(by: 'w' | 'b') {
    provider.send('resign', { by });
  }

  function handleDrawOfferBroadcast(by: 'w' | 'b') {
    provider.send('draw-offer', { by });
  }

  function handleDrawResponseBroadcast(accepted: boolean) {
    provider.send('draw-response', { accepted });
  }

  function handleAcceptJoin(joinerId: string) {
    const request = pendingRequests.find((r) => r.playerId === joinerId);
    if (request) setBlackName(request.name);
    setPendingRequests((prev) => prev.filter((r) => r.playerId !== joinerId));
    provider.send('join-approved', { playerId: joinerId });
    // The host flips to the board immediately on their own click; the
    // joiner flips the moment the 'join-approved' broadcast above arrives
    // on their screen — both happen within the same realtime round-trip.
    setGameStarted(true);
  }

  function handleDeclineJoin(joinerId: string) {
    setPendingRequests((prev) => prev.filter((r) => r.playerId !== joinerId));
    provider.send('join-declined', { playerId: joinerId });
  }

  const isPlayer = role === 'w' || role === 'b';
  const isMyTurn = isPlayer && engine.turn === role;
  const isConnected = status === 'connected';
  const copy = STATUS_COPY[status];
  const orientation = role === 'b' ? 'black' : 'white';

  if (!gameStarted) {
    return (
      <div className="flex flex-col gap-4 items-center">
        <div className={`flex items-center gap-2 text-sm ${copy.tone}`}>
          {status === 'connected' && <Wifi size={16} />}
          {status === 'connecting' && <Loader2 size={16} className="animate-spin" />}
          {(status === 'disconnected' || status === 'unconfigured') && <WifiOff size={16} />}
          {copy.label}
        </div>

        {role === 'w' ? (
          <HostLobby
            gameId={gameId}
            pendingRequests={pendingRequests}
            onAccept={handleAcceptJoin}
            onDecline={handleDeclineJoin}
          />
        ) : (
          <JoinerLobby status={joinStatus} hostSeenOnline={isConnected} />
        )}
      </div>
    );
  }

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
        <ChessSidebar
          whiteName={whiteName}
          blackName={blackName}
          youAre={isPlayer ? role : null}
          controlsYouAre={isPlayer ? role : 'both'}
          showControls={isPlayer}
          onResign={handleResignBroadcast}
          onDrawOffer={handleDrawOfferBroadcast}
          onDrawResponse={handleDrawResponseBroadcast}
        >
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
