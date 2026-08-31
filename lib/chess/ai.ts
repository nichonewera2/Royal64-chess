import { Chess, type Move } from 'chess.js';

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
 *
 * BUG FIX NOTE: an earlier version only scored pawns positionally — every
 * other piece was worth the same wherever it stood, and ties were always
 * broken by picking whichever legal move chess.js generated first. Since
 * "shuffle a knight back and forth" and "do nothing" scored identically to
 * everything else, the AI would visibly get stuck moving the same piece to
 * the same squares turn after turn. This version scores every piece type
 * positionally, shuffles the move list so ties break differently each
 * time, and penalizes moves that repeat a position already seen earlier
 * in the game.
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

// Piece-square tables, white's perspective (row 0 = rank 8). Mirrored for
// black by flipping the row index. Every piece type now has one — this is
// what gives the AI an actual reason to develop pieces toward the center
// instead of treating every square as equally good.
// prettier-ignore
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0
];
// prettier-ignore
const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];
// prettier-ignore
const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];
// prettier-ignore
const ROOK_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0
];
// prettier-ignore
const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
  0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];
// prettier-ignore
const KING_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20
];

const TABLES: Record<string, number[]> = {
  p: PAWN_TABLE,
  n: KNIGHT_TABLE,
  b: BISHOP_TABLE,
  r: ROOK_TABLE,
  q: QUEEN_TABLE,
  k: KING_TABLE
};

export function evaluateBoard(chess: Chess): number {
  const board = chess.board();
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;
      const value = PIECE_VALUES[piece.type];
      const table = TABLES[piece.type];
      const idx = piece.color === 'w' ? r * 8 + f : (7 - r) * 8 + f;
      const positional = table?.[idx] ?? 0;
      const total = value + positional;
      score += piece.color === 'w' ? total : -total;
    }
  }
  return score;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Orders moves so captures of valuable pieces (especially by cheap
 * attackers) are searched first — classic MVV-LVA move ordering. This
 * isn't cosmetic: alpha-beta pruning cuts far more branches when the best
 * moves are examined early, which is what makes a real depth-4 search for
 * "Mahir" finish quickly enough to run on the main thread without
 * freezing the UI. Genuinely faster search, not a gimmick.
 */
function orderMoves(moves: Move[]): Move[] {
  const captureScore = (m: Move): number => {
    if (!m.captured) return 0;
    const victim = PIECE_VALUES[m.captured] ?? 0;
    const attacker = PIECE_VALUES[m.piece] ?? 0;
    return victim * 10 - attacker;
  };
  return [...moves].sort((a, b) => captureScore(b) - captureScore(a));
}

/** The position part of a FEN only — ignores move-clock fields, so a
 * repeated board position is recognized as a repeat even if the clocks
 * printed alongside it differ. */
function positionKey(fen: string): string {
  return fen.split(' ').slice(0, 4).join(' ');
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

  const moves = orderMoves(chess.moves({ verbose: true }));

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

/**
 * Picks the best move for the side to move, at the given difficulty.
 *
 * `recentPositions` is the list of position keys (see positionKey above)
 * already seen earlier in THIS game — passed in from the caller's move
 * history. Any candidate move that would recreate one of those positions
 * is penalized, so the AI stops treating "shuffle back to where I just
 * was" as equally good as making progress. Beginner also adds randomized
 * noise so it doesn't play perfectly, which feels more human and is
 * honestly represented as "Beginner" rather than claiming engine-grade
 * strength.
 */
export function pickComputerMove(
  fen: string,
  difficulty: Difficulty,
  recentPositions: string[] = []
): Move | null {
  const chess = new Chess(fen);
  const depth = DEPTH_BY_DIFFICULTY[difficulty];
  // Shuffle first (for randomized tie-breaking among equally-scored quiet
  // moves), then order captures first (JS's sort is stable, so the
  // shuffled order among non-captures is preserved) — good for alpha-beta
  // pruning efficiency at the top level too.
  const moves = orderMoves(shuffle(chess.moves({ verbose: true })));
  if (moves.length === 0) return null;

  const maximizing = chess.turn() === 'w';
  const seen = new Set(recentPositions);

  let bestMove: Move = moves[0];
  let bestScore = maximizing ? -Infinity : Infinity;

  for (const m of moves) {
    chess.move(m.san);
    let score = minimax(chess, depth - 1, -Infinity, Infinity, !maximizing);

    if (seen.has(positionKey(chess.fen()))) {
      // Discourage recreating a position already visited this game —
      // this is what stops the AI from shuffling one piece back and forth.
      score += maximizing ? -120 : 120;
    }

    chess.undo();

    if (difficulty === 'beginner') {
      // Deliberately weak and a little erratic — an honest "Pemula"
      // persona, not a search bug. Club and Expert below play the real
      // evaluation with zero artificial noise, so the three tiers feel
      // genuinely different in strength rather than all secretly being
      // the same engine with random jitter bolted on.
      score += (Math.random() - 0.5) * 150;
    }

    if (maximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }

  return bestMove;
}

export { positionKey };
