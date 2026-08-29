'use client';

import { Flag, Handshake, RotateCcw } from 'lucide-react';
import { useGameStore } from '@/lib/store/gameStore';

interface ChessControlsProps {
  onResign?: () => void;
  onOfferDraw?: () => void;
}

export function ChessControls({ onResign, onOfferDraw }: ChessControlsProps) {
  const { resetGame, mode } = useGameStore();

  return (
    <div className="flex gap-2">
      <button
        onClick={onResign}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-espresso-800 hover:bg-mahogany-600 text-parchment-100 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
      >
        <Flag size={16} /> Resign
      </button>
      <button
        onClick={onOfferDraw}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-espresso-800 hover:bg-mahogany-600 text-parchment-100 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
      >
        <Handshake size={16} /> Offer Draw
      </button>
      <button
        onClick={() => resetGame(mode)}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-espresso-800 hover:bg-mahogany-600 text-parchment-100 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
      >
        <RotateCcw size={16} /> New Game
      </button>
    </div>
  );
}
