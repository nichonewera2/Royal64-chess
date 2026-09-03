'use client';

import { motion } from 'framer-motion';
import type { Color, PieceSymbol } from 'chess.js';
import { PieceGraphic } from './PieceGraphics';

const PIECE_NAME_ID: Record<PieceSymbol, string> = {
  p: 'pion',
  n: 'kuda',
  b: 'gajah',
  r: 'benteng',
  q: 'menteri',
  k: 'raja'
};

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  isLifted?: boolean;
}

export function ChessPiece({ type, color, isLifted }: ChessPieceProps) {
  const isWhite = color === 'w';

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      className={`select-none pointer-events-none flex items-center justify-center w-full h-full p-[8%] ${
        isLifted ? 'scale-110 -translate-y-1' : ''
      }`}
      style={{
        transition: 'transform 120ms ease-out',
        filter: isWhite
          ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.45))'
          : 'drop-shadow(0 0 2px rgba(240,168,60,0.4)) drop-shadow(0 2px 2px rgba(0,0,0,0.55))'
      }}
      aria-label={`${isWhite ? 'Putih' : 'Hitam'} ${PIECE_NAME_ID[type]}`}
    >
      <svg viewBox="0 0 45 45" className="w-full h-full overflow-visible">
        <PieceGraphic type={type} color={color} />
      </svg>
    </motion.div>
  );
}
