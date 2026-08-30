'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import type { Square } from 'chess.js';
import { useGameStore } from '@/lib/store/gameStore';
import { ChessSquare } from './ChessSquare';
import { PromotionModal } from './PromotionModal';
import {
  playMoveSound,
  playCaptureSound,
  playCastleSound,
  playCheckSound,
  playGameEndSound
} from '@/lib/audio/sfx';

interface ChessBoardProps {
  /** When false, the board flips to show black at the bottom. */
  orientation?: 'white' | 'black';
  /** Called after a human move is committed, useful for AI turn-taking. */
  onMoveCommitted?: (from: Square, to: Square) => void;
  /** Disables interaction, e.g. while it isn't the local player's turn online. */
  locked?: boolean;
}

export function ChessBoard({
  orientation = 'white',
  onMoveCommitted,
  locked = false
}: ChessBoardProps) {
  const { engine, selectedSquare, legalTargets, selectSquare, playMove, status, moveList, lastMoveMeta } =
    useGameStore();

  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(
    null
  );

  // Plays a sound whenever a move actually lands in the store — this fires
  // for BOTH the local player's move and an opponent's move arriving over
  // realtime, since both paths update moveList/lastMoveMeta the same way.
  const lastPlayedCount = useRef(0);
  useEffect(() => {
    if (moveList.length === 0) {
      lastPlayedCount.current = 0;
      return;
    }
    if (moveList.length === lastPlayedCount.current) return;
    lastPlayedCount.current = moveList.length;

    if (status === 'checkmate' || status.startsWith('draw') || status === 'stalemate') {
      playGameEndSound();
    } else if (status === 'check') {
      playCheckSound();
    } else if (lastMoveMeta?.isCastle) {
      playCastleSound();
    } else if (lastMoveMeta?.isCapture) {
      playCaptureSound();
    } else {
      playMoveSound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveList.length]);

  // moveList.length is intentionally in the deps: it forces a re-derive of
  // the board snapshot after each move commits, even though `engine` itself
  // is the same mutable instance.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const board = useMemo(() => engine.board(), [engine, moveList.length]);
  const lastMove = engine.history[engine.history.length - 1];
  const isInCheck = status === 'check' || status === 'checkmate';

  const rows = orientation === 'white' ? board : [...board].reverse();

  function handleSelect(square: Square) {
    if (locked) return;

    if (selectedSquare && legalTargets.includes(square)) {
      const isPromotion =
        engine
          .legalMovesFrom(selectedSquare)
          .find((m) => m.to === square)?.promotion !== undefined;

      if (isPromotion) {
        setPendingPromotion({ from: selectedSquare, to: square });
        return;
      }

      const ok = playMove(selectedSquare, square);
      if (ok) onMoveCommitted?.(selectedSquare, square);
      return;
    }

    const moves = engine.legalMovesFrom(square);
    if (moves.length > 0) {
      selectSquare(square, moves.map((m) => m.to as Square));
    } else {
      selectSquare(null, []);
    }
  }

  function confirmPromotion(piece: 'q' | 'r' | 'b' | 'n') {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    const ok = playMove(from, to, piece);
    if (ok) onMoveCommitted?.(from, to);
    setPendingPromotion(null);
  }

  return (
    <div className="relative w-full max-w-[min(90vw,640px)] mx-auto">
      <div className="rounded-lg overflow-hidden shadow-board border-4 border-walnut-800">
        <div className="grid grid-cols-8">
          {rows.map((rowArr, rIdx) => {
            const displayRow = orientation === 'white' ? rowArr : [...rowArr].reverse();
            return displayRow.map((cell, cIdx) => {
              const rank = cell.square[1];
              const file = cell.square[0];
              const isDark = (rIdx + cIdx) % 2 === 1;
              return (
                <ChessSquare
                  key={cell.square}
                  square={cell.square}
                  piece={cell.piece}
                  isDark={isDark}
                  isSelected={selectedSquare === cell.square}
                  isLegalTarget={legalTargets.includes(cell.square)}
                  isLastMove={lastMove?.from === cell.square || lastMove?.to === cell.square}
                  isCheck={
                    isInCheck && cell.piece?.type === 'k' && cell.piece.color === engine.turn
                  }
                  onSelect={handleSelect}
                  fileLabel={rIdx === rows.length - 1 ? file : undefined}
                  rankLabel={cIdx === 0 ? rank : undefined}
                />
              );
            });
          })}
        </div>
      </div>

      {pendingPromotion && (
        <PromotionModal
          color={engine.turn}
          onSelect={confirmPromotion}
          onClose={() => setPendingPromotion(null)}
        />
      )}
    </div>
  );
}
