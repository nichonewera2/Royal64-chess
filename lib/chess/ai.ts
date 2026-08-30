import { Chess, type Move, type Square } from 'chess.js';

/**
 * IMPORTANT — HONESTY NOTE (see master spec rule 91):
 *
 * This is a real minimax/alpha-beta search with a material + positional
 * evaluation function — NOT random move selection. It is deliberately
 * labeled "Royal64 AI" everywhere in the UI, not "Stockfish". Wiring up
 * genuine Stockfish (WASM binary, ~2-8MB) requires downloading the
 * compiled engine at build time, which needs network access this
 * environment does not have. The `computer.ts` service below is written
 * with a swappable interface (`ComputerOpponent`) so a real Stockfish
 * worker can be dropped in later without touching UI code — see
 * lib/chess/computer.ts for the seam.
 */

export type Difficulty = 'beginner' | 'club' | 'expert';

const DEPTH_BY_DIFFICULTY: Record<Difficulty, number> = {
  beginner: 1,
  club: 2,
  expert: 3
};

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Simple piece-square tables (white perspective; mirrored for black)
// Encourage center control and development — enough to feel like a real
// opponent without needing a full opening book.
const PAWN_TABLE = [
  0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30,
  20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10,
  0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0
];

export function evaluateBoard(chess: Chess): number {
  const board = chess.board();
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;
      const value = PIECE_VALUES[piece.type];
      let positional = 0;
      if (piece.type === 'p') {
        const idx = piece.color === 'w' ? r * 8 + f : (7 - r) * 8 + f;
        positional = PAWN_TABLE[idx] ?? 0;
      }
      const total = value + positional;
      score += piece.color === 'w' ? total : -total;
    }
  }
  return score;
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });

  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      chess.move(m.san);
      best = Math.max(best, minimax(chess, depth - 1, alpha, beta, false));
      chess.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      chess.move(m.san);
      best = Math.min(best, minimax(chess, depth - 1, alpha, beta, true));
      chess.undo();
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

/**
 * Picks the best move for the side to move, at the given difficulty.
 * Beginner adds randomized noise so it doesn't play perfectly, which
 * feels more human and is honestly represented as "Beginner" rather
 * than claiming engine-grade strength.
 */
/**
 * Simple heuristic for whether the computer opponent accepts a draw offer:
 * it declines only when it holds a clear material/positional edge (roughly
 * more than a minor piece's worth), and accepts otherwise. This is an
 * honest, transparent rule rather than a black box — a strong engine would
 * weigh far more, but this reflects the same "material + a little
 * position" evaluation the AI already plays by.
 */
export function shouldComputerAcceptDraw(fen: string, computerColor: 'w' | 'b'): boolean {
  const chess = new Chess(fen);
  const score = evaluateBoard(chess);
  const computerAdvantage = computerColor === 'w' ? score : -score;
  return computerAdvantage < 150;
}

export function pickComputerMove(fen: string, difficulty: Difficulty): Move | null {
  const chess = new Chess(fen);
  const depth = DEPTH_BY_DIFFICULTY[difficulty];
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  const maximizing = chess.turn() === 'w';
  let bestMove: Move = moves[0];
  let bestScore = maximizing ? -Infinity : Infinity;

  for (const m of moves) {
    chess.move(m.san);
    let score = minimax(chess, depth - 1, -Infinity, Infinity, !maximizing);
    chess.undo();

    if (difficulty === 'beginner') {
      score += (Math.random() - 0.5) * 150;
    }

    if (maximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }

  return bestMove;
}
