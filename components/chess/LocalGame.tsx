'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { ChessBoard } from './ChessBoard';
import { ChessSidebar } from './ChessSidebar';

export function LocalGame() {
  const { resetGame } = useGameStore();

  useEffect(() => {
    resetGame('local');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      <ChessBoard />
      <ChessSidebar opponentLabel="Player 2 (Black)" />
    </div>
  );
}
