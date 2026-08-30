'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight, RotateCcw } from 'lucide-react';
import type { Square } from 'chess.js';
import { useGameStore } from '@/lib/store/gameStore';
import { PUZZLES } from '@/lib/chess/puzzles';
import { ChessBoard } from './ChessBoard';
import { playGameEndSound } from '@/lib/audio/sfx';

const DIFFICULTY_COLOR: Record<string, string> = {
  mudah: 'text-emerald-400 border-emerald-500/50',
  sedang: 'text-gold-400 border-gold-500/50',
  sulit: 'text-red-400 border-red-500/50'
};

export function PuzzleMode() {
  const { engine, moveList, loadFen, undoLastMove } = useGameStore();
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const puzzle = PUZZLES[puzzleIndex];

  useEffect(() => {
    loadFen(puzzle.fen, 'local');
    setStepIndex(0);
    setFeedback(null);
    setSolved(false);
    setShowHint(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleIndex]);

  useEffect(() => {
    if (moveList.length === 0) return;

    const lastMove = engine.history[engine.history.length - 1];
    const expected = puzzle.solution[stepIndex];
    if (!lastMove || !expected) return;

    const isCorrect =
      lastMove.from === expected.from &&
      lastMove.to === expected.to &&
      (expected.promotion ? lastMove.promotion === expected.promotion : true);

    if (isCorrect) {
      setFeedback('correct');
      const nextStep = stepIndex + 1;
      if (nextStep >= puzzle.solution.length) {
        setSolved(true);
        playGameEndSound();
      } else {
        setStepIndex(nextStep);
      }
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        undoLastMove();
        setFeedback(null);
      }, 700);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveList.length]);

  function handleNextPuzzle() {
    setPuzzleIndex((i) => (i + 1) % PUZZLES.length);
  }

  function handleRetry() {
    loadFen(puzzle.fen, 'local');
    setStepIndex(0);
    setFeedback(null);
    setSolved(false);
    setShowHint(false);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      <div className="flex flex-col gap-3 items-center w-full">
        <ChessBoard locked={solved} />
      </div>

      <aside className="w-full lg:w-80 flex flex-col gap-3">
        <div className="bg-espresso-900/60 bg-[url('/textures/wood-grain.svg')] bg-cover bg-blend-multiply border border-walnut-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-lg text-parchment-100">{puzzle.title}</h3>
            <span
              className={`text-[11px] uppercase tracking-wide border rounded-full px-2 py-0.5 ${DIFFICULTY_COLOR[puzzle.difficulty]}`}
            >
              {puzzle.difficulty}
            </span>
          </div>
          <p className="text-parchment-300/80 text-sm mb-3">{puzzle.description}</p>
          <p className="text-xs text-parchment-300/50">
            Puzzle {puzzleIndex + 1} dari {PUZZLES.length} · Giliran{' '}
            {puzzle.sideToMove === 'w' ? 'Putih' : 'Hitam'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {feedback === 'correct' && !solved && (
            <motion.div
              key="correct-step"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/50 rounded-lg px-3 py-2 text-emerald-300 text-sm"
            >
              <CheckCircle2 size={16} /> Langkah tepat! Lanjutkan.
            </motion.div>
          )}
          {feedback === 'wrong' && (
            <motion.div
              key="wrong-step"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-red-600/20 border border-red-500/50 rounded-lg px-3 py-2 text-red-300 text-sm"
            >
              <XCircle size={16} /> Belum tepat — posisi dikembalikan, coba lagi.
            </motion.div>
          )}
          {solved && (
            <motion.div
              key="solved"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2 bg-gold-500/15 border border-gold-500/50 rounded-lg px-3 py-3 text-gold-300"
            >
              <span className="flex items-center gap-2 font-display text-base">
                <CheckCircle2 size={18} /> Puzzle Terpecahkan!
              </span>
              <button
                onClick={handleNextPuzzle}
                className="flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium py-2 rounded-lg mt-1"
              >
                Puzzle Berikutnya <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!solved && (
          <div className="flex flex-col gap-2">
            {showHint && (
              <p className="text-xs text-parchment-300/70 bg-espresso-900/50 border border-walnut-700 rounded-lg px-3 py-2">
                Petunjuk: gerakkan bidak dari petak{' '}
                <span className="text-gold-400 font-mono">
                  {puzzle.solution[stepIndex]?.from}
                </span>
                .
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShowHint((v) => !v)}
                className="flex-1 flex items-center justify-center gap-2 bg-espresso-800 hover:bg-mahogany-600 text-parchment-100 text-sm px-3 py-2 rounded-md"
              >
                <Lightbulb size={15} /> {showHint ? 'Sembunyikan' : 'Petunjuk'}
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 flex items-center justify-center gap-2 bg-espresso-800 hover:bg-mahogany-600 text-parchment-100 text-sm px-3 py-2 rounded-md"
              >
                <RotateCcw size={15} /> Ulangi
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
