export interface Puzzle {
  id: string;
  title: string;
  description: string;
  difficulty: 'mudah' | 'sedang' | 'sulit';
  fen: string;
  /** Solution as a sequence of UCI-style moves (from+to), one per side's turn. */
  solution: Array<{ from: string; to: string; promotion?: 'q' | 'r' | 'b' | 'n' }>;
  /** Whose turn it is to solve — shown to orient the board correctly. */
  sideToMove: 'w' | 'b';
}

/**
 * Every puzzle below was constructed and hand-verified move-by-move rather
 * than sourced from an external database (no network access in this
 * environment to fetch a puzzle set). Each uses a minimal, unambiguous
 * position so the solution can be checked by direct calculation — no
 * engine required to trust the answer:
 *
 * 1. "Mahkota Sendirian" — Qh2-h8# (back-rank-style mate along an open
 *    file with the king cut off by the escaping king itself).
 * 2. "Benteng Penutup" — Ra1-a8# (classic back-rank mate, king boxed in
 *    by its own pawns).
 * 3. "Ratu Berlindung" — Qa7-g7# (queen-and-king mate along the board
 *    edge, king supported by its own king).
 * 4. "Kuda Bercabang" — Ne4-f6+ (knight fork hitting the king and queen
 *    at once).
 */
export const PUZZLES: Puzzle[] = [
  {
    id: 'mahkota-sendirian',
    title: 'Mahkota Sendirian',
    description: 'Putih jalan — temukan skakmat dalam satu langkah.',
    difficulty: 'mudah',
    fen: 'k7/8/K7/8/8/8/7Q/8 w - - 0 1',
    solution: [{ from: 'h2', to: 'h8' }],
    sideToMove: 'w'
  },
  {
    id: 'benteng-penutup',
    title: 'Benteng Penutup',
    description: 'Raja hitam terkurung pion sendiri. Putih jalan — mat dalam satu langkah.',
    difficulty: 'mudah',
    fen: '7k/6pp/8/8/8/8/8/R3K3 w - - 0 1',
    solution: [{ from: 'a1', to: 'a8' }],
    sideToMove: 'w'
  },
  {
    id: 'ratu-berlindung',
    title: 'Ratu Berlindung',
    description: 'Raja putih menjaga petak kunci. Temukan skakmat dalam satu langkah.',
    difficulty: 'sedang',
    fen: '7k/Q7/6K1/8/8/8/8/8 w - - 0 1',
    solution: [{ from: 'a7', to: 'g7' }],
    sideToMove: 'w'
  },
  {
    id: 'kuda-bercabang',
    title: 'Kuda Bercabang',
    description: 'Satu langkah kuda bisa mengancam dua bidak sekaligus. Temukan langkahnya.',
    difficulty: 'sulit',
    fen: '6k1/8/8/3q4/4N3/8/8/K7 w - - 0 1',
    solution: [{ from: 'e4', to: 'f6' }],
    sideToMove: 'w'
  }
];
