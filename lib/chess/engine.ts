import { Chess, type Square, type Move, type PieceSymbol, type Color } from 'chess.js';
import { positionKey } from './ai';

/**
 * Royal64 chess engine wrapper.
 *
 * Wraps chess.js (the industry-standard, fully-tested rules engine) so that
 * the rest of the app never talks to raw FEN/PGN directly. This is where
 * check, checkmate, stalemate, draw, castling, en passant and promotion
 * are all delegated to a battle-tested library rather than re-implemented
 * by hand — re-implementing chess rules from scratch is exactly the kind
 * of thing that quietly ships subtle bugs (e.g. en passant edge cases).
 */

export type GameStatus =
  | 'in_progress'
  | 'check'
  | 'checkmate'
  | 'stalemate'
  | 'draw_50move'
  | 'draw_repetition'
  | 'draw_insufficient_material'
  | 'draw_agreement'
  | 'resigned'
  | 'timeout';

export interface MoveResult {
  move: Move;
  fen: string;
  status: GameStatus;
  winner: Color | null;
  isPromotion: boolean;
  isCapture: boolean;
  isCastle: boolean;
  isEnPassant: boolean;
}

export interface SquareInfo {
  square: Square;
  piece: { type: PieceSymbol; color: Color } | null;
}

export class Royal64Engine {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = fen ? new Chess(fen) : new Chess();
  }

  get fen(): string {
    return this.chess.fen();
  }

  get pgn(): string {
    return this.chess.pgn();
  }

  get turn(): Color {
    return this.chess.turn();
  }

  get history(): Move[] {
    return this.chess.history({ verbose: true });
  }

  /**
   * Position keys (board+turn+castling+en passant, ignoring move clocks)
   * for every position reached so far this game — used by the computer
   * opponent to avoid repeating a position it just came from. See
   * lib/chess/ai.ts positionKey / pickComputerMove.
   */
  recentPositionKeys(): string[] {
    return this.history.map((m) => positionKey((m as any).after ?? this.chess.fen()));
  }

  board(): SquareInfo[][] {
    return this.chess.board().map((rank, rankIdx) =>
      rank.map((piece, fileIdx) => {
        const file = 'abcdefgh'[fileIdx];
        const rankNum = 8 - rankIdx;
        return {
          square: `${file}${rankNum}` as Square,
          piece: piece ? { type: piece.type, color: piece.color } : null
        };
      })
    );
  }

  legalMovesFrom(square: Square): Move[] {
    return this.chess.moves({ square, verbose: true });
  }

  isSquareAttacked(square: Square, byColor: Color): boolean {
    return this.chess.isAttacked(square, byColor);
  }

  computeStatus(): { status: GameStatus; winner: Color | null } {
    if (this.chess.isCheckmate()) {
      const winner: Color = this.chess.turn() === 'w' ? 'b' : 'w';
      return { status: 'checkmate', winner };
    }
    if (this.chess.isStalemate()) return { status: 'stalemate', winner: null };
    if (this.chess.isThreefoldRepetition())
      return { status: 'draw_repetition', winner: null };
    if (this.chess.isInsufficientMaterial())
      return { status: 'draw_insufficient_material', winner: null };
    if (this.chess.isDraw()) return { status: 'draw_50move', winner: null };
    if (this.chess.isCheck()) return { status: 'check', winner: null };
    return { status: 'in_progress', winner: null };
  }

  move(input: {
    from: Square;
    to: Square;
    promotion?: 'q' | 'r' | 'b' | 'n';
  }): MoveResult | null {
    let move: Move | null;
    try {
      move = this.chess.move({
        from: input.from,
        to: input.to,
        promotion: input.promotion ?? 'q'
      });
    } catch {
      return null;
    }
    if (!move) return null;

    const { status, winner } = this.computeStatus();

    return {
      move,
      fen: this.chess.fen(),
      status,
      winner,
      isPromotion: Boolean(move.promotion),
      isCapture: Boolean(move.captured),
      isCastle: move.flags.includes('k') || move.flags.includes('q'),
      isEnPassant: move.flags.includes('e')
    };
  }

  undo(): Move | null {
    return this.chess.undo();
  }

  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  clone(): Royal64Engine {
    return new Royal64Engine(this.chess.fen());
  }

  reset(): void {
    this.chess.reset();
  }

  loadPgn(pgn: string): void {
    this.chess.loadPgn(pgn);
  }
}
