'use client';

import { ChessClock } from './ChessClock';
import { MoveHistory } from './MoveHistory';
import { ChessControls, type ControlsYouAre } from './ChessControls';
import { GameStatusBanner } from './GameStatusBanner';

interface ChessSidebarProps {
  whiteName: string;
  blackName: string;
  /** Which color, if any, is "you" — highlights that nameplate. */
  youAre?: 'w' | 'b' | null;
  /** Controls behavior: 'w'/'b' fixed side, 'both' for local pass-and-play. */
  controlsYouAre: ControlsYouAre;
  /** False hides the resign/draw/new-game controls entirely — for spectators. */
  showControls?: boolean;
  onResign?: (by: 'w' | 'b') => void;
  onDrawOffer?: (by: 'w' | 'b') => void;
  opponentIsComputer?: boolean;
  children?: React.ReactNode;
}

export function ChessSidebar({
  whiteName,
  blackName,
  youAre = null,
  controlsYouAre,
  showControls = true,
  onResign,
  onDrawOffer,
  opponentIsComputer,
  children
}: ChessSidebarProps) {
  return (
    <aside className="w-full lg:w-80 flex flex-col gap-3">
      <ChessClock color="b" name={blackName} isYou={youAre === 'b'} />
      <GameStatusBanner />
      <MoveHistory />
      <ChessClock color="w" name={whiteName} isYou={youAre === 'w'} />
      {showControls && (
        <ChessControls
          youAre={controlsYouAre}
          onResign={onResign}
          onDrawOffer={onDrawOffer}
          opponentIsComputer={opponentIsComputer}
        />
      )}
      {children}
    </aside>
  );
}
