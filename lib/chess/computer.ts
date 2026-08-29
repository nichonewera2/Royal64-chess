import type { Move } from 'chess.js';
import { pickComputerMove, type Difficulty } from './ai';

export interface ComputerOpponent {
  readonly label: string;
  getMove(fen: string, difficulty: Difficulty): Promise<Move | null>;
}

/**
 * Default opponent: the local minimax engine in ai.ts. Swap this out for
 * a real Stockfish WASM worker by implementing the same interface — the
 * UI (ComputerGame.tsx) only ever calls `opponent.getMove(fen, difficulty)`.
 */
export const royal64AI: ComputerOpponent = {
  label: 'Royal64 AI',
  async getMove(fen, difficulty) {
    // Wrapped in a microtask + tiny delay so the UI can show a "thinking"
    // state instead of the move landing instantly, which reads as fake.
    await new Promise((r) => setTimeout(r, 250 + Math.random() * 350));
    return pickComputerMove(fen, difficulty);
  }
};

export function getComputerOpponent(): ComputerOpponent {
  return royal64AI;
}
