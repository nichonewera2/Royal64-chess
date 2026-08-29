'use client';

import type { Square, PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import clsx from 'clsx';

interface ChessSquareProps {
  square: Square;
  piece: { type: PieceSymbol; color: Color } | null;
  isDark: boolean;
  isSelected: boolean;
  isLegalTarget: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  onSelect: (square: Square) => void;
  fileLabel?: string;
  rankLabel?: string;
}

export function ChessSquare({
  square,
  piece,
  isDark,
  isSelected,
  isLegalTarget,
  isLastMove,
  isCheck,
  onSelect,
  fileLabel,
  rankLabel
}: ChessSquareProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(square)}
      aria-label={`Square ${square}${piece ? `, ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ', empty'}`}
      className={clsx(
        'relative aspect-square w-full flex items-center justify-center transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:z-10',
        isDark ? 'bg-wood-dark' : 'bg-wood-light',
        isSelected && 'ring-4 ring-inset ring-gold-500',
        isLastMove && !isSelected && 'ring-2 ring-inset ring-gold-400/60',
        isCheck && 'animate-check-pulse'
      )}
    >
      {fileLabel && (
        <span className="absolute bottom-0.5 right-1 text-[9px] font-body opacity-50 pointer-events-none">
          {fileLabel}
        </span>
      )}
      {rankLabel && (
        <span className="absolute top-0.5 left-1 text-[9px] font-body opacity-50 pointer-events-none">
          {rankLabel}
        </span>
      )}
      {piece && <ChessPiece type={piece.type} color={piece.color} />}
      {isLegalTarget && !piece && (
        <span className="absolute w-1/3 h-1/3 rounded-full bg-gold-500/50 pointer-events-none" />
      )}
      {isLegalTarget && piece && (
        <span className="absolute inset-1 rounded-full ring-4 ring-mahogany-500/70 pointer-events-none" />
      )}
    </button>
  );
}
