'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
import { isValidGameId, parseTimeControlParam } from '@/lib/chess/gameId';
import { OnlineGame, type SeatRole } from '@/components/chess/OnlineGame';
import { usePlayerStore } from '@/lib/store/playerStore';
import { useToastStore } from '@/components/ui/Toast';

export default function GameRoomPage() {
  const params = useParams<{ gameId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const push = useToastStore((s) => s.push);
  const { name, playerId, hydrated, hydrate } = usePlayerStore();

  const gameId = decodeURIComponent(params.gameId ?? '').toUpperCase();
  const valid = isValidGameId(gameId);
  const isSpectating = searchParams.get('watch') === '1';
  const isHost = searchParams.get('host') === '1';
  // The host picks their color in RoomSetup and it's carried in ?seat=;
  // the shared/QR link seats the joiner as the opposite color (see
  // lib/chess/gameId.ts buildJoinUrl/buildHostUrl). Defaults to White only
  // as a safety fallback for a malformed/missing param.
  const role: SeatRole = isSpectating ? 'spectator' : searchParams.get('seat') === 'b' ? 'b' : 'w';
  const timeControlMs = parseTimeControlParam(searchParams.get('time'));

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!valid) {
      push('Ruang permainan tidak ditemukan.', 'error');
    }
  }, [valid, push]);

  if (!valid) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-espresso-950 px-6">
        <div className="text-center max-w-sm">
          <h1 className="font-display text-2xl text-parchment-100 mb-2">
            Ruang permainan tidak ditemukan.
          </h1>
          <p className="text-parchment-300/70 mb-6">
            Periksa kembali Game ID-nya, atau minta lawanmu membagikan ulang kode QR.
          </p>
          <Link href="/game" className="text-gold-400 underline">
            Kembali ke Portal Permainan
          </Link>
        </div>
      </main>
    );
  }

  if (!hydrated) return null; // brief flash while player identity loads

  const displayName = name ?? (role === 'spectator' ? 'Penonton' : 'Pemain');

  return (
    <main className="min-h-screen bg-espresso-950 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/game')} className="text-parchment-300/70 hover:text-gold-400">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-2xl text-parchment-100 flex items-center gap-2">
            Ruang <span className="text-gold-400 font-mono">{gameId}</span>
            {role === 'spectator' && <Eye size={18} className="text-gold-400" />}
          </h1>
        </div>
        <OnlineGame
          gameId={gameId}
          playerId={playerId}
          playerName={displayName}
          role={role}
          isHost={isHost}
          timeControlMs={timeControlMs}
        />
      </div>
    </main>
  );
}
