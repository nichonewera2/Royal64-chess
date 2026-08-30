'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/lib/store/gameStore';

const MESSAGES: Record<string, string> = {
  check: 'Skak!',
  checkmate: 'Skakmat',
  stalemate: 'Seri — Buntu (Stalemate)',
  draw_50move: 'Seri — Aturan 50 langkah',
  draw_repetition: 'Seri — Pengulangan posisi',
  draw_insufficient_material: 'Seri — Bidak tidak cukup',
  draw_agreement: 'Seri disepakati',
  resigned: 'Menyerah',
  timeout: 'Waktu habis'
};

export function GameStatusBanner() {
  const { status, winner } = useGameStore();
  if (status === 'in_progress') return null;

  const message = MESSAGES[status] ?? status;
  const suffix =
    status === 'checkmate' || status === 'resigned' || status === 'timeout'
      ? winner
        ? ` — ${winner === 'w' ? 'Putih' : 'Hitam'} menang`
        : ''
      : '';

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
