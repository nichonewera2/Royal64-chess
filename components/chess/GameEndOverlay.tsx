'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Frown, Handshake, RotateCcw, X } from 'lucide-react';
import { useGameStore } from '@/lib/store/gameStore';
import { playWinSound, playLoseSound, playDrawSound, playGameStartSound } from '@/lib/audio/sfx';

type Outcome = 'win' | 'lose' | 'draw';

interface GameEndOverlayProps {
  /**
   * Which color the overlay should celebrate/console FOR. 'w'/'b' for a
   * fixed-side player (computer/online), null for local pass-and-play or
   * spectators — in that case the overlay stays neutral and just
   * announces who won, without a personalized "you win/lose" framing.
   */
  perspective: 'w' | 'b' | null;
}

const REASON_LABEL: Record<string, string> = {
  checkmate: 'Skakmat',
  resigned: 'Menyerah',
  timeout: 'Waktu Habis',
  stalemate: 'Buntu (Stalemate)',
  draw_50move: 'Aturan 50 Langkah',
  draw_repetition: 'Pengulangan Posisi',
  draw_insufficient_material: 'Bidak Tidak Cukup',
  draw_agreement: 'Seri Disepakati'
};

const DRAW_STATUSES = new Set([
  'stalemate',
  'draw_50move',
  'draw_repetition',
  'draw_insufficient_material',
  'draw_agreement'
]);

/** Small colored confetti pieces that burst outward from center and fall. */
function Confetti() {
  const pieces = useRef(
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      angle: (i / 28) * Math.PI * 2 + Math.random() * 0.3,
      distance: 120 + Math.random() * 160,
      size: 6 + Math.random() * 6,
      color: ['#f0a83c', '#ffe3ab', '#e08e1f', '#faf1de'][i % 4],
      rotate: Math.random() * 360,
      delay: Math.random() * 0.25
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance + 220,
            opacity: 0,
            rotate: p.rotate
          }}
          transition={{ duration: 1.8 + Math.random() * 0.6, delay: p.delay, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/3 block rounded-sm"
          style={{ width: p.size, height: p.size * 0.6, backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

export function GameEndOverlay({ perspective }: GameEndOverlayProps) {
  const { status, winner, resetGame, mode } = useGameStore();
  const [dismissed, setDismissed] = useState(false);
  const lastAnnounced = useRef<string | null>(null);

  const isGameOver = status !== 'in_progress' && status !== 'check';
  const isDraw = DRAW_STATUSES.has(status);

  let outcome: Outcome | null = null;
  if (isGameOver) {
    if (isDraw) outcome = 'draw';
    else if (perspective && winner) outcome = winner === perspective ? 'win' : 'lose';
    else outcome = null; // no personal perspective (local/spectator) and not a draw
  }

  // Reset the dismiss flag and play the right sound exactly once per
  // distinct game-ending event (keyed by status+winner so a rematch's new
  // ending re-triggers correctly).
  useEffect(() => {
    const key = isGameOver ? `${status}:${winner ?? ''}` : null;
    if (key && lastAnnounced.current !== key) {
      lastAnnounced.current = key;
      setDismissed(false);
      if (outcome === 'win') playWinSound();
      else if (outcome === 'lose') playLoseSound();
      else playDrawSound();
    }
    if (!isGameOver) lastAnnounced.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver, status, winner]);

  function handleNewGame() {
    setDismissed(true);
    resetGame(mode);
    playGameStartSound();
  }

  const visible = isGameOver && !dismissed;
  const reasonText = REASON_LABEL[status] ?? status;

  let heading = 'Permainan Selesai';
  let icon = <Handshake size={44} className="text-gold-300" />;
  let accent = 'from-gold-500/30';

  if (outcome === 'win') {
    heading = 'Kamu Menang!';
    icon = <Trophy size={48} className="text-gold-300" />;
    accent = 'from-emerald-500/25';
  } else if (outcome === 'lose') {
    heading = 'Kamu Kalah';
    icon = <Frown size={44} className="text-parchment-300" />;
    accent = 'from-mahogany-600/25';
  } else if (outcome === 'draw') {
    heading = 'Seri';
    icon = <Handshake size={44} className="text-gold-300" />;
    accent = 'from-gold-500/25';
  } else if (winner) {
    heading = winner === 'w' ? 'Putih Menang!' : 'Hitam Menang!';
    icon = <Trophy size={48} className="text-gold-300" />;
    accent = 'from-emerald-500/25';
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-espresso-950/85 backdrop-blur-md px-6"
        >
          {outcome === 'win' || (!perspective && winner) ? <Confetti /> : null}

          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={`relative w-full max-w-sm rounded-3xl border-2 border-gold-500/50 bg-gradient-to-b ${accent} to-espresso-900 bg-[url('/textures/wood-grain.svg')] bg-cover bg-blend-multiply p-8 text-center shadow-board`}
          >
            <button
              onClick={() => setDismissed(true)}
              aria-label="Tutup"
              className="absolute top-4 right-4 text-parchment-300/50 hover:text-parchment-100"
            >
              <X size={18} />
            </button>

            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.15 }}
              className="mx-auto mb-4 w-20 h-20 rounded-full border-2 border-gold-500/60 flex items-center justify-center bg-espresso-950/60"
            >
              {icon}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="font-display text-3xl text-parchment-100 mb-1"
            >
              {heading}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-sm text-gold-400/90 mb-6"
            >
              {reasonText}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              onClick={handleNewGame}
              className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium py-3 rounded-xl transition-colors"
            >
              <RotateCcw size={16} /> Main Baru
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
