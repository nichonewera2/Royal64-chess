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
 * Default opponent: the local minimax engine in ai.ts. Swap this out for
 * a real Stockfish WASM worker by implementing the same interface — the
 * UI (ComputerGame.tsx) only ever calls
 * `opponent.getMove(fen, difficulty, recentPositions)`.
 */
export const royal64AI: ComputerOpponent = {
  label: 'Royal64 AI',
  async getMove(fen, difficulty, recentPositions = []) {
    // Wrapped in a microtask + tiny delay so the UI can show a "thinking"
    // state instead of the move landing instantly, which reads as fake.
    await new Promise((r) => setTimeout(r, 250 + Math.random() * 350));
    return pickComputerMove(fen, difficulty, recentPositions);
  }
};

export function getComputerOpponent(): ComputerOpponent {
  return royal64AI;
}
