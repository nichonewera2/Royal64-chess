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
  gameId: string | null;
  lastMoveMeta: { isCapture: boolean; isCastle: boolean; isPromotion: boolean } | null;
  /** Which color currently has a pending outgoing draw offer awaiting a response. */
  drawOfferedBy: 'w' | 'b' | null;

  selectSquare: (square: Square | null, legalTargets: Square[]) => void;
  playMove: (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => boolean;
  resetGame: (mode: GameMode) => void;
  setGameId: (id: string | null) => void;
  tickClock: (color: 'w' | 'b', deltaMs: number) => void;
  resign: (by: 'w' | 'b') => void;
  offerDraw: (by: 'w' | 'b') => void;
  respondDraw: (accepted: boolean) => void;
  loadFen: (fen: string, mode: GameMode) => void;
  undoLastMove: () => void;
}

const INITIAL_CLOCK_MS = 10 * 60 * 1000; // 10 minutes per side default

export const useGameStore = create<GameStoreState>((set, get) => ({
  engine: new Royal64Engine(),
  fen: new Royal64Engine().fen,
  mode: 'local',
  status: 'in_progress',
  winner: null,
  selectedSquare: null,
  legalTargets: [],
  moveList: [],
  clock: { whiteMs: INITIAL_CLOCK_MS, blackMs: INITIAL_CLOCK_MS, activeSince: Date.now() },
  gameId: null,
  lastMoveMeta: null,
  drawOfferedBy: null,

  selectSquare: (square, legalTargets) => set({ selectedSquare: square, legalTargets }),

  playMove: (from, to, promotion) => {
    const { engine, moveList } = get();
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
      }
    });
    return true;
  },

  resetGame: (mode) => {
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
      clock: { whiteMs: INITIAL_CLOCK_MS, blackMs: INITIAL_CLOCK_MS, activeSince: Date.now() },
      lastMoveMeta: null,
      drawOfferedBy: null
    });
  },

  setGameId: (id) => set({ gameId: id }),

  tickClock: (color, deltaMs) =>
    set((s) => ({
      clock: {
        ...s.clock,
        whiteMs: color === 'w' ? Math.max(0, s.clock.whiteMs - deltaMs) : s.clock.whiteMs,
        blackMs: color === 'b' ? Math.max(0, s.clock.blackMs - deltaMs) : s.clock.blackMs
      }
    })),

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

  loadFen: (fen, mode) => {
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
      clock: { whiteMs: INITIAL_CLOCK_MS, blackMs: INITIAL_CLOCK_MS, activeSince: Date.now() },
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
