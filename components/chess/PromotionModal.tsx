'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Color } from 'chess.js';

const PIECES: Array<{ key: 'q' | 'r' | 'b' | 'n'; label: string }> = [
  { key: 'q', label: 'Queen' },
  { key: 'r', label: 'Rook' },
  { key: 'b', label: 'Bishop' },
  { key: 'n', label: 'Knight' }
];

const GLYPHS: Record<Color, Record<string, string>> = {
  w: { q: '♕', r: '♖', b: '♗', n: '♘' },
  b: { q: '♛', r: '♜', b: '♝', n: '♞' }
};

interface PromotionModalProps {
  color: Color;
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onClose: () => void;
}

export function PromotionModal({ color, onSelect, onClose }: PromotionModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-label="Choose promotion piece"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-20 flex items-center justify-center bg-espresso-950/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-walnut-800 bg-[url('/textures/wood-grain.svg')] bg-cover border border-gold-500/40 rounded-xl p-6 shadow-panel"
        >
          <p className="font-display text-parchment-100 text-center mb-4 text-lg">
            Promote your pawn
          </p>
          <div className="flex gap-3">
            {PIECES.map((p) => (
              <button
                key={p.key}
                onClick={() => onSelect(p.key)}
                className="w-16 h-16 rounded-lg bg-espresso-900 hover:bg-mahogany-600 transition-colors flex items-center justify-center text-4xl text-parchment-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                aria-label={p.label}
              >
                {GLYPHS[color][p.key]}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
