'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Handshake, Check, X } from 'lucide-react';
import { useGameStore } from '@/lib/store/gameStore';
import { playNotificationSound } from '@/lib/audio/sfx';

interface DrawOfferOverlayProps {
  /** 'w'/'b' for a fixed-side player; 'both' for local pass-and-play. */
  youAre: 'w' | 'b' | 'both';
  onRespond?: (accepted: boolean) => void;
}

/**
 * Renders as a FIXED overlay near the top of the viewport — not inline in
 * the sidebar. The old inline banner lived inside ChessControls, which on
 * mobile sits below the board in a scrollable column, so the opponent
 * receiving a draw offer often couldn't see it without scrolling down.
 * This can't be missed regardless of scroll position.
 */
export function DrawOfferOverlay({ youAre, onRespond }: DrawOfferOverlayProps) {
  const { drawOfferedBy, respondDraw, status } = useGameStore();
  const lastAnnounced = useRef<string | null>(null);

  const gameOver = status !== 'in_progress' && status !== 'check';
  const isIncoming =
    drawOfferedBy !== null && !gameOver && (youAre === 'both' || drawOfferedBy !== youAre);

  useEffect(() => {
    const key = drawOfferedBy ? `${drawOfferedBy}` : null;
    if (isIncoming && key && lastAnnounced.current !== key) {
      lastAnnounced.current = key;
      playNotificationSound();
    }
    if (!drawOfferedBy) lastAnnounced.current = null;
  }, [isIncoming, drawOfferedBy]);

  function handleRespond(accepted: boolean) {
    respondDraw(accepted);
    onRespond?.(accepted);
  }

  return (
    <AnimatePresence>
      {isIncoming && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[150] w-[min(92vw,420px)]"
        >
          <div className="flex items-center gap-3 bg-walnut-800 bg-[url('/textures/wood-grain.svg')] bg-cover border-2 border-gold-500/60 rounded-2xl px-5 py-4 shadow-board">
            <span className="w-11 h-11 shrink-0 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center animate-pulse">
              <Handshake size={20} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-display text-parchment-100 leading-tight">
                {youAre === 'both'
                  ? `${drawOfferedBy === 'w' ? 'Putih' : 'Hitam'} menawarkan seri`
                  : 'Lawan menawarkan seri'}
              </p>
              <p className="text-xs text-parchment-300/60">Terima atau tolak sekarang</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={() => handleRespond(true)}
                aria-label="Terima seri"
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <Check size={14} /> Ya
              </button>
              <button
                onClick={() => handleRespond(false)}
                aria-label="Tolak seri"
                className="flex items-center gap-1 bg-espresso-900 hover:bg-mahogany-600 text-parchment-200 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <X size={14} /> Tidak
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
