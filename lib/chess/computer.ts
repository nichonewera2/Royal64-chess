import type { Move } from 'chess.js';
import { pickComputerMove, type Difficulty } from './ai';

export interface ComputerOpponent {
  readonly label: string;
  /**
   * `recentPositions` is the list of position keys already reached earlier
   * in this game (see lib/chess/ai.ts positionKey) — used so the AI avoids
   * shuffling a piece back into a position it just came from.
   */
  getMove(fen: string, difficulty: Difficulty, recentPositions?: string[]): Promise<Move | null>;
}

/**
 * Artificial "thinking" delay, scaled by difficulty. Two real reasons this
 * exists rather than resolving instantly:
 *
 * 1. Honesty: an instant move reads as fake regardless of difficulty.
 * 2. It also fixes a reported "the computer's clock doesn't move" report —
 *    the clock logic itself was always correct (the opponent's clock ticks
 *    the instant it becomes their turn), but at the old 250-600ms delay,
 *    a few tenths of a second is imperceptible against a 10-minute clock.
 *    Scaling this by difficulty makes the tick visible AND makes "Mahir"
 *    genuinely feel like it's thinking harder than "Pemula" — not just a
 *    label with the same instant response underneath.
 */
const THINK_DELAY_MS: Record<Difficulty, [number, number]> = {
  beginner: [400, 900],
  club: [900, 1700],
  expert: [1800, 3200]
};

function randomDelay([min, max]: [number, number]): number {
  return min + Math.random() * (max - min);
}

/**
 * Default opponent: the local minimax engine in ai.ts. Swap this out for
 * a real Stockfish WASM worker by implementing the same interface — the
 * UI (ComputerGame.tsx) only ever calls
 * `opponent.getMove(fen, difficulty, recentPositions)`.
 */
export const royal64AI: ComputerOpponent = {
  label: 'Royal64 AI',
  async getMove(fen, difficulty, recentPositions = []) {
    await new Promise((r) => setTimeout(r, randomDelay(THINK_DELAY_MS[difficulty])));
    return pickComputerMove(fen, difficulty, recentPositions);
  }
};

export function getComputerOpponent(): ComputerOpponent {
  return royal64AI;
}
