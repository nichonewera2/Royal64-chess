import { describe, it, expect } from 'vitest';
import { Royal64Engine } from '@/lib/chess/engine';

describe('Royal64Engine', () => {
  it('starts with the standard opening position', () => {
    const engine = new Royal64Engine();
    expect(engine.turn).toBe('w');
    expect(engine.fen).toContain('rnbqkbnr/pppppppp');
  });

  it('rejects illegal moves', () => {
    const engine = new Royal64Engine();
    const result = engine.move({ from: 'e2', to: 'e5' });
    expect(result).toBeNull();
  });

  it('plays a legal pawn opening', () => {
    const engine = new Royal64Engine();
    const result = engine.move({ from: 'e2', to: 'e4' });
    expect(result).not.toBeNull();
    expect(result?.status).toBe('in_progress');
  });

  it("detects Fool's Mate checkmate", () => {
    const engine = new Royal64Engine();
    engine.move({ from: 'f2', to: 'f3' });
    engine.move({ from: 'e7', to: 'e5' });
    engine.move({ from: 'g2', to: 'g4' });
    const result = engine.move({ from: 'd8', to: 'h4' });
    expect(result?.status).toBe('checkmate');
    expect(result?.winner).toBe('b');
  });

  it('handles castling (kingside, white)', () => {
    const engine = new Royal64Engine(
      'rnbqk1nr/pppp1ppp/8/4p3/4P3/5N2/PPPPBPPP/RNBQK2R w KQkq - 0 1'
    );
    const result = engine.move({ from: 'e1', to: 'g1' });
    expect(result).not.toBeNull();
    expect(result?.isCastle).toBe(true);
  });

  it('handles en passant capture', () => {
    const engine = new Royal64Engine();
    engine.move({ from: 'e2', to: 'e4' });
    engine.move({ from: 'a7', to: 'a6' });
    engine.move({ from: 'e4', to: 'e5' });
    engine.move({ from: 'd7', to: 'd5' });
    const result = engine.move({ from: 'e5', to: 'd6' });
    expect(result?.isEnPassant).toBe(true);
  });

  it('handles pawn promotion', () => {
    const engine = new Royal64Engine('8/P7/8/8/8/8/8/k1K5 w - - 0 1');
    const result = engine.move({ from: 'a7', to: 'a8', promotion: 'q' });
    expect(result?.isPromotion).toBe(true);
  });

  it('generates a valid, unique Game ID', async () => {
    const { generateGameId, isValidGameId } = await import('@/lib/chess/gameId');
    const id = generateGameId();
    expect(isValidGameId(id)).toBe(true);
    expect(id).toMatch(/^R64-[A-Z2-9]{5}$/);
  });

  it('builds a join URL that seats the joiner as Black', async () => {
    const { generateGameId, buildJoinUrl } = await import('@/lib/chess/gameId');
    const id = generateGameId();
    const url = buildJoinUrl(id, 'https://royal64.app');
    expect(url).toBe(`https://royal64.app/game/${id}?seat=b`);
  });
});
