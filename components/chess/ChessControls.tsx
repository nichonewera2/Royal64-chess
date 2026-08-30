'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Handshake, RotateCcw, Check, X } from 'lucide-react';
import { useGameStore } from '@/lib/store/gameStore';

export type ControlsYouAre = 'w' | 'b' | 'both';

interface ChessControlsProps {
  /** 'w'/'b' when you're a fixed side (computer/online); 'both' for local pass-and-play. */
  youAre: ControlsYouAre;
  /** Called when a resign/draw-offer/draw-response happens, so online mode can broadcast it. */
  onResign?: (by: 'w' | 'b') => void;
  onDrawOffer?: (by: 'w' | 'b') => void;
  onDrawResponse?: (accepted: boolean) => void;
  /** True only for vs-computer mode: the "opponent" auto-decides instead of a human. */
  opponentIsComputer?: boolean;
}

export function ChessControls({
  youAre,
  onResign,
  onDrawOffer,
  onDrawResponse,
  opponentIsComputer
}: ChessControlsProps) {
  const { resetGame, mode, engine, status, resign, offerDraw, drawOfferedBy, respondDraw } =
    useGameStore();
  const [confirmingResign, setConfirmingResign] = useState<'w' | 'b' | null>(null);
  const [pickingResignSide, setPickingResignSide] = useState(false);

  const gameOver = status !== 'in_progress' && status !== 'check';

  function resignAs(color: 'w' | 'b') {
    resign(color);
    onResign?.(color);
    setConfirmingResign(null);
    setPickingResignSide(false);
  }

  function handleResignClick() {
    if (youAre === 'both') {
      // Local pass-and-play: ask which side is resigning first.
      setPickingResignSide(true);
    } else {
      setConfirmingResign(youAre);
    }
  }

  function handleDrawOfferClick() {
    const by = youAre === 'both' ? engine.turn : youAre;
    offerDraw(by);
    onDrawOffer?.(by);

    if (opponentIsComputer) {
      // The computer "opponent" is always the color you're not playing.
      import('@/lib/chess/ai').then(({ shouldComputerAcceptDraw }) => {
        const computerColor = by === 'w' ? 'b' : 'w';
        const accepts = shouldComputerAcceptDraw(engine.fen, computerColor);
        setTimeout(() => respondDraw(accepts), 700);
      });
    }
  }

  const pendingOffer = drawOfferedBy !== null && !gameOver;
  const offerIsIncoming = pendingOffer && (youAre === 'both' || drawOfferedBy !== youAre);

  return (
    <div className="flex flex-col gap-2">
      {/* Incoming draw offer banner */}
      <AnimatePresence>
        {offerIsIncoming && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between gap-2 bg-gold-500/15 border border-gold-500/50 rounded-lg px-3 py-2 text-sm text-parchment-100"
          >
            <span>
              {youAre === 'both'
                ? `${drawOfferedBy === 'w' ? 'Putih' : 'Hitam'} menawarkan seri.`
                : 'Lawan menawarkan seri.'}
            </span>
            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={() => {
                  respondDraw(true);
                  onDrawResponse?.(true);
                }}
                className="flex items-center gap-1 bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs px-2.5 py-1.5 rounded-md"
              >
                <Check size={13} /> Terima
              </button>
              <button
                onClick={() => {
                  respondDraw(false);
                  onDrawResponse?.(false);
                }}
                className="flex items-center gap-1 bg-espresso-800 hover:bg-mahogany-600 text-parchment-100 text-xs px-2.5 py-1.5 rounded-md"
              >
                <X size={13} /> Tolak
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiting-for-response indicator (the side who just offered) */}
      {pendingOffer && !offerIsIncoming && (
        <p className="text-xs text-parchment-300/60 italic text-center">
          Menunggu lawan merespons tawaran seri…
        </p>
      )}

      {/* Resign side-picker for local pass-and-play */}
      <AnimatePresence>
        {pickingResignSide && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between gap-2 bg-mahogany-600/20 border border-mahogany-500/50 rounded-lg px-3 py-2 text-sm text-parchment-100"
          >
            <span>Siapa yang menyerah?</span>
            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={() => resignAs('w')}
                className="bg-espresso-800 hover:bg-mahogany-600 text-xs px-2.5 py-1.5 rounded-md"
              >
                Putih
              </button>
              <button
                onClick={() => resignAs('b')}
                className="bg-espresso-800 hover:bg-mahogany-600 text-xs px-2.5 py-1.5 rounded-md"
              >
                Hitam
              </button>
              <button
                onClick={() => setPickingResignSide(false)}
                className="text-parchment-300/60 hover:text-parchment-100 text-xs px-1.5"
              >
                Batal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resign confirmation for fixed-side modes */}
      <AnimatePresence>
        {confirmingResign && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between gap-2 bg-mahogany-600/20 border border-mahogany-500/50 rounded-lg px-3 py-2 text-sm text-parchment-100"
          >
            <span>Yakin ingin menyerah?</span>
            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={() => resignAs(confirmingResign)}
                className="bg-mahogany-600 hover:bg-mahogany-500 text-white text-xs px-2.5 py-1.5 rounded-md"
              >
                Ya, Menyerah
              </button>
              <button
                onClick={() => setConfirmingResign(null)}
                className="text-parchment-300/60 hover:text-parchment-100 text-xs px-1.5"
              >
                Batal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2">
        <button
          onClick={handleResignClick}
          disabled={gameOver}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-espresso-800 hover:bg-mahogany-600 disabled:opacity-40 disabled:hover:bg-espresso-800 text-parchment-100 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          <Flag size={16} /> Menyerah
        </button>
        <button
          onClick={handleDrawOfferClick}
          disabled={gameOver || pendingOffer}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-espresso-800 hover:bg-mahogany-600 disabled:opacity-40 disabled:hover:bg-espresso-800 text-parchment-100 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          <Handshake size={16} /> Tawarkan Seri
        </button>
        <button
          onClick={() => resetGame(mode)}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-espresso-800 hover:bg-mahogany-600 text-parchment-100 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          <RotateCcw size={16} /> Main Baru
        </button>
      </div>
    </div>
  );
}
