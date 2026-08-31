'use client';

import { useEffect, useState } from 'react';
import type { Square } from 'chess.js';
import { useGameStore } from '@/lib/store/gameStore';
import { usePlayerStore } from '@/lib/store/playerStore';
import { getComputerOpponent } from '@/lib/chess/computer';
import type { Difficulty } from '@/lib/chess/ai';
import { ChessBoard } from './ChessBoard';
import { ChessSidebar } from './ChessSidebar';

const DIFFICULTIES: Difficulty[] = ['beginner', 'club', 'expert'];
const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: 'Pemula',
  club: 'Menengah',
  expert: 'Mahir'
};

export function ComputerGame() {
  const { fen, engine, status, resetGame, playMove } = useGameStore();
  const { name, hydrated, hydrate } = usePlayerStore();
  const [difficulty, setDifficulty] = useState<Difficulty>('club');
  const [thinking, setThinking] = useState(false);
  const opponent = getComputerOpponent();

  useEffect(() => {
    hydrate();
    resetGame('computer');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (engine.turn !== 'b') return;
    if (status === 'checkmate' || status === 'stalemate') return;

    let cancelled = false;
    setThinking(true);
    opponent.getMove(fen, difficulty, engine.recentPositionKeys()).then((move) => {
      if (cancelled || !move) return;
      playMove(move.from as Square, move.to as Square, move.promotion as any);
      setThinking(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen]);

  const playerName = hydrated ? name ?? 'Kamu' : 'Kamu';

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      <div className="flex flex-col gap-3 items-center w-full">
        <div className="flex gap-2 flex-wrap justify-center">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wide border transition-colors ${
                difficulty === d
                  ? 'bg-gold-500 text-espresso-950 border-gold-500'
                  : 'bg-transparent text-parchment-200 border-walnut-700 hover:border-gold-500/60'
              }`}
            >
              {DIFFICULTY_LABEL[d]}
            </button>
          ))}
        </div>
        <ChessBoard locked={engine.turn === 'b' || thinking} />
        {thinking && (
          <p className="text-parchment-300/70 text-sm italic">
            {opponent.label} sedang berpikir…
          </p>
        )}
      </div>
      <ChessSidebar
        whiteName={playerName}
        blackName={`${opponent.label} · ${DIFFICULTY_LABEL[difficulty]}`}
        youAre="w"
        controlsYouAre="w"
        opponentIsComputer
      />
    </div>
  );
}
