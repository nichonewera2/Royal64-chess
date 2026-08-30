'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { usePlayerStore } from '@/lib/store/playerStore';
import { ChessBoard } from './ChessBoard';
import { ChessSidebar } from './ChessSidebar';

export function LocalGame() {
  const { resetGame } = useGameStore();
  const { name, hydrated, hydrate } = usePlayerStore();
  const [player2Name, setPlayer2Name] = useState('Pemain 2');
  const [editingP2, setEditingP2] = useState(false);
  const [draft, setDraft] = useState('Pemain 2');

  useEffect(() => {
    hydrate();
    resetGame('local');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const player1Name = hydrated ? name ?? 'Pemain 1' : 'Pemain 1';

  return (
    <div className="flex flex-col gap-3 items-center">
      {editingP2 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPlayer2Name(draft.trim() || 'Pemain 2');
            setEditingP2(false);
          }}
          className="flex gap-2"
        >
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={24}
            className="bg-espresso-900 border border-walnut-700 focus:border-gold-500 rounded-lg px-3 py-1.5 font-player text-lg text-parchment-100 outline-none"
          />
          <button
            type="submit"
            className="text-xs bg-gold-500 text-espresso-950 px-3 py-1.5 rounded-lg font-medium"
          >
            Simpan
          </button>
        </form>
      ) : (
        <button
          onClick={() => setEditingP2(true)}
          className="text-xs text-parchment-300/70 hover:text-gold-400 underline"
        >
          Ganti nama Pemain 2 (Black)
        </button>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full">
        <ChessBoard />
        <ChessSidebar whiteName={player1Name} blackName={player2Name} controlsYouAre="both" />
      </div>
    </div>
  );
}
