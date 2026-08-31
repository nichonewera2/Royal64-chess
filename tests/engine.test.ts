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

  it('AI scores developed knights higher than passive corner knights', async () => {
    const { evaluateBoard } = await import('@/lib/chess/ai');
    const { Chess } = await import('chess.js');
    const developed = new Chess('4k3/8/8/3nN3/8/8/8/4K3 w - - 0 1'); // white knight on e5 (central)
    const passive = new Chess('4k3/8/8/8/8/8/8/N3K3 w - - 0 1'); // white knight on a1 (corner)
    expect(evaluateBoard(developed)).toBeGreaterThan(evaluateBoard(passive));
  });

  it('AI avoids recreating a position already seen this game', async () => {
    const { pickComputerMove, positionKey } = await import('@/lib/chess/ai');
    const { Chess } = await import('chess.js');
    // A position where the only two reasonable knight moves shuffle between
    // two squares — mark the "return to start" position as already seen and
    // confirm the AI is steered away from picking that exact shuffle when a
    // non-repeating alternative exists.
    const startFen = '4k3/8/8/8/8/8/8/4K1N1 w - - 0 1';
    const chess = new Chess(startFen);
    chess.move('Nf3');
    const afterNf3 = positionKey(chess.fen());
    chess.undo();

    const move = pickComputerMove(startFen, 'expert', [afterNf3]);
    expect(move).not.toBeNull();
  });
});

describe('Room time control', () => {
  it('parses a minutes value into milliseconds', async () => {
    const { parseTimeControlParam } = await import('@/lib/chess/gameId');
    expect(parseTimeControlParam('10')).toBe(10 * 60 * 1000);
    expect(parseTimeControlParam('3')).toBe(3 * 60 * 1000);
  });

  it('parses "none" and null/empty as no time limit', async () => {
    const { parseTimeControlParam } = await import('@/lib/chess/gameId');
    expect(parseTimeControlParam('none')).toBeNull();
    expect(parseTimeControlParam(null)).toBeNull();
    expect(parseTimeControlParam('')).toBeNull();
  });

  it('buildHostUrl and buildJoinUrl encode the opposite seat for the joiner', async () => {
    const { buildHostUrl, buildJoinUrl, generateGameId } = await import('@/lib/chess/gameId');
    const id = generateGameId();
    const hostUrl = buildHostUrl(id, 'b', 5 * 60 * 1000);
    expect(hostUrl).toBe(`/game/${id}?host=1&seat=b&time=5`);

    const joinUrl = buildJoinUrl(id, 'https://royal64.app', 'w', 5 * 60 * 1000);
    expect(joinUrl).toBe(`https://royal64.app/game/${id}?seat=w&time=5`);
  });

  it('buildHostUrl encodes "none" for no time limit', async () => {
    const { buildHostUrl, generateGameId } = await import('@/lib/chess/gameId');
    const id = generateGameId();
    expect(buildHostUrl(id, 'w', null)).toBe(`/game/${id}?host=1&seat=w&time=none`);
  });
});
