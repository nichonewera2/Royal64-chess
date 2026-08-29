'use client';

import { ChessClock } from './ChessClock';
import { MoveHistory } from './MoveHistory';
import { ChessControls } from './ChessControls';
import { GameStatusBanner } from './GameStatusBanner';

interface ChessSidebarProps {
  opponentLabel: string;
  onResign?: () => void;
  onOfferDraw?: () => void;
}

export function ChessSidebar({ opponentLabel, onResign, onOfferDraw }: ChessSidebarProps) {
  return (
    <aside className="w-full lg:w-80 flex flex-col gap-3">
      <ChessClock color="b" label={opponentLabel} />
      <GameStatusBanner />
      <MoveHistory />
      <ChessClock color="w" label="You" />
      <ChessControls onResign={onResign} onOfferDraw={onOfferDraw} />
    </aside>
  );
}
