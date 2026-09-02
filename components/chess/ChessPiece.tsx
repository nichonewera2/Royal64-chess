'use client';

import { motion } from 'framer-motion';
import type { Color, PieceSymbol } from 'chess.js';

const GLYPHS: Record<Color, Record<PieceSymbol, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
};

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
  // Contrast fix: the old version rendered black pieces as near-pure-black
  // text with a black drop-shadow on squares that are ALSO near-black
  // (bg-wood-dark) — the piece and the board were practically the same
  // color, so black pieces were nearly invisible on dark squares. White
  // pieces had a similar (milder) problem on the light tan squares. Real
  // wood chess sets solve this with a carved rim/inlay that catches light
  // regardless of the square color — this reproduces that with a
  // contrasting outline (text-stroke) plus a shadow colored to glow
  // rather than disappear.
  const isWhite = color === 'w';

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      className={`select-none pointer-events-none flex items-center justify-center w-full h-full text-[clamp(28px,6vw,52px)] leading-none ${
        isWhite ? 'text-ivory' : 'text-[#150d06]'
      } ${isLifted ? 'scale-110 -translate-y-1' : ''}`}
      style={{
        transition: 'transform 120ms ease-out',
        WebkitTextStroke: isWhite ? '1.25px #2a1d12' : '1.4px #e3c691',
        filter: isWhite
          ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))'
          : 'drop-shadow(0 0 2px rgba(240,168,60,0.55)) drop-shadow(0 2px 2px rgba(0,0,0,0.6))'
      }}
      aria-label={`${isWhite ? 'Putih' : 'Hitam'} ${PIECE_NAME_ID[type]}`}
    >
      {GLYPHS[color][type]}
    </motion.div>
  );
}
