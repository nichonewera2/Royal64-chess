import { create } from 'zustand';
import type { Square } from 'chess.js';
import { Royal64Engine, type GameStatus } from '@/lib/chess/engine';

export type GameMode = 'computer' | 'local' | 'online';

export interface ClockState {
  whiteMs: number;
  blackMs: number;
  activeSince: number | null;
}

interface GameStoreState {
  engine: Royal64Engine;
  fen: string;
  mode: GameMode;
  status: GameStatus;
  winner: 'w' | 'b' | null;
  selectedSquare: Square | null;
  legalTargets: Square[];
  moveList: string[];
  clock: ClockState;
  /** Starting time per side in ms, or null for no time limit ("tanpa batas waktu"). */
  timeControlMs: number | null;
  gameId: string | null;
  lastMoveMeta: { isCapture: boolean; isCastle: boolean; isPromotion: boolean } | null;
  /** Which color currently has a pending outgoing draw offer awaiting a response. */
  drawOfferedBy: 'w' | 'b' | null;

  selectSquare: (square: Square | null, legalTargets: Square[]) => void;
  playMove: (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => boolean;
  resetGame: (mode: GameMode, timeControlMs?: number | null) => void;
  setGameId: (id: string | null) => void;
  /**
   * Checks whether the side to move has run out of time RIGHT NOW, based
   * on wall-clock time since `clock.activeSince` — not on accumulated
   * interval ticks. Call this periodically (e.g. every 250ms) while a
   * clock is active; safe to call redundantly.
   */
  checkTimeout: () => void;
  resign: (by: 'w' | 'b') => void;
  offerDraw: (by: 'w' | 'b') => void;
  respondDraw: (accepted: boolean) => void;
  loadFen: (fen: string, mode: GameMode, timeControlMs?: number | null) => void;
  undoLastMove: () => void;
}

const DEFAULT_TIME_CONTROL_MS = 10 * 60 * 1000; // 10 minutes per side default

function makeClock(timeControlMs: number | null): ClockState {
  const ms = timeControlMs ?? 0;
  return { whiteMs: ms, blackMs: ms, activeSince: Date.now() };
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  engine: new Royal64Engine(),
  fen: new Royal64Engine().fen,
  mode: 'local',
  status: 'in_progress',
  winner: null,
  selectedSquare: null,
  legalTargets: [],
  moveList: [],
  clock: makeClock(DEFAULT_TIME_CONTROL_MS),
  timeControlMs: DEFAULT_TIME_CONTROL_MS,
  gameId: null,
  lastMoveMeta: null,
  drawOfferedBy: null,

  selectSquare: (square, legalTargets) => set({ selectedSquare: square, legalTargets }),

  playMove: (from, to, promotion) => {
    const { engine, moveList, clock, timeControlMs } = get();

    // Deduct real elapsed wall-clock time from the mover's clock BEFORE
    // applying the move — computed directly from `activeSince`, not from
    // accumulated setInterval ticks. This is what makes the clock correct
    // even when a long synchronous computation (e.g. the computer AI's
    // minimax search) blocks the main thread for a few seconds: no matter
    // how long that block lasted, `Date.now() - activeSince` still
    // captures the true elapsed time in one shot right here, so nothing
    // gets lost the way an interval-based tick could when it's torn down
    // mid-block before it fires.
    const mover = engine.turn;
    let nextClock = clock;
    if (timeControlMs !== null && clock.activeSince !== null) {
      const elapsed = Date.now() - clock.activeSince;
      nextClock = {
        whiteMs: mover === 'w' ? Math.max(0, clock.whiteMs - elapsed) : clock.whiteMs,
        blackMs: mover === 'b' ? Math.max(0, clock.blackMs - elapsed) : clock.blackMs,
        activeSince: Date.now()
      };
    }

    const result = engine.move({ from, to, promotion });
    if (!result) return false;

    set({
      fen: result.fen,
      status: result.status,
      winner: result.winner,
      selectedSquare: null,
      legalTargets: [],
      moveList: [...moveList, result.move.san],
      lastMoveMeta: {
        isCapture: result.isCapture,
        isCastle: result.isCastle,
        isPromotion: result.isPromotion
      },
      clock: nextClock
    });
    return true;
  },

  resetGame: (mode, timeControlMs = DEFAULT_TIME_CONTROL_MS) => {
    const engine = new Royal64Engine();
    set({
      engine,
      fen: engine.fen,
      mode,
      status: 'in_progress',
      winner: null,
      selectedSquare: null,
      legalTargets: [],
      moveList: [],
      clock: makeClock(timeControlMs),
      timeControlMs,
      lastMoveMeta: null,
      drawOfferedBy: null
    });
  },

  setGameId: (id) => set({ gameId: id }),

  checkTimeout: () =>
    set((s) => {
      if (s.timeControlMs === null || s.clock.activeSince === null) return {};
      if (s.status !== 'in_progress' && s.status !== 'check') return {};

      const mover = s.engine.turn;
      const elapsed = Date.now() - s.clock.activeSince;
      const remaining = mover === 'w' ? s.clock.whiteMs - elapsed : s.clock.blackMs - elapsed;
      if (remaining > 0) return {};

      return {
        status: 'timeout' as GameStatus,
        winner: mover === 'w' ? 'b' : ('w' as const),
        clock: {
          ...s.clock,
          whiteMs: mover === 'w' ? 0 : s.clock.whiteMs,
          blackMs: mover === 'b' ? 0 : s.clock.blackMs
        }
      };
    }),

  resign: (by) =>
    set({
      status: 'resigned',
      winner: by === 'w' ? 'b' : 'w',
      drawOfferedBy: null
    }),

  offerDraw: (by) => set({ drawOfferedBy: by }),

  respondDraw: (accepted) =>
    set((s) =>
      accepted
        ? { status: 'draw_agreement', winner: null, drawOfferedBy: null }
        : { drawOfferedBy: null }
    ),

  loadFen: (fen, mode, timeControlMs = DEFAULT_TIME_CONTROL_MS) => {
    const engine = new Royal64Engine(fen);
    set({
      engine,
      fen: engine.fen,
      mode,
      status: 'in_progress',
      winner: null,
      selectedSquare: null,
      legalTargets: [],
      moveList: [],
      clock: makeClock(timeControlMs),
      timeControlMs,
      lastMoveMeta: null,
      drawOfferedBy: null
    });
  },

  undoLastMove: () => {
    const { engine, moveList } = get();
    const undone = engine.undo();
    if (!undone) return;
    const { status } = engine.computeStatus();
    set({
      fen: engine.fen,
      status,
      winner: null,
      selectedSquare: null,
      legalTargets: [],
      moveList: moveList.slice(0, -1),
      lastMoveMeta: null
    });
  }
}));
