'use client';

import { ChessClock } from './ChessClock';
import { MoveHistory } from './MoveHistory';
import { ChessControls } from './ChessControls';
import { GameStatusBanner } from './GameStatusBanner';

interface ChessSidebarProps {
  whiteName: string;
  blackName: string;
  /** Which color, if any, is "you" — highlights that nameplate. */
  youAre?: 'w' | 'b' | null;
  onResign?: () => void;
  onOfferDraw?: () => void;
  children?: React.ReactNode;
}

export function ChessSidebar({
  whiteName,
  blackName,
  youAre = null,
  onResign,
  onOfferDraw,
  children
}: ChessSidebarProps) {
  return (
    <aside className="w-full lg:w-80 flex flex-col gap-3">
      <ChessClock color="b" name={blackName} isYou={youAre === 'b'} />
      <GameStatusBanner />
      <MoveHistory />
      <ChessClock color="w" name={whiteName} isYou={youAre === 'w'} />
      <ChessControls onResign={onResign} onOfferDraw={onOfferDraw} />
      {children}
    </aside>
  );
}
