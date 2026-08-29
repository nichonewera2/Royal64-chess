'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';

const MESSAGES: Record<string, string> = {
  check: 'Check!',
  checkmate: 'Checkmate',
  stalemate: 'Stalemate — Draw',
  draw_50move: 'Draw — 50-move rule',
  draw_repetition: 'Draw — Threefold repetition',
  draw_insufficient_material: 'Draw — Insufficient material',
  draw_agreement: 'Draw agreed',
  resigned: 'Resignation',
  timeout: 'Time out'
};

export function GameStatusBanner() {
  const { status, winner } = useGameStore();
  if (status === 'in_progress') return null;

  const message = MESSAGES[status] ?? status;
  const suffix =
    status === 'checkmate' && winner ? ` — ${winner === 'w' ? 'White' : 'Black'} wins` : '';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-center py-2 px-3 rounded-md bg-gold-500/15 border border-gold-500/50 text-gold-400 font-display text-sm"
        role="status"
      >
        {message}
        {suffix}
      </motion.div>
    </AnimatePresence>
  );
}
