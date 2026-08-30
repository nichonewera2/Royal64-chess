import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Realtime provider (offline fallback)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    vi.resetModules();
  });

  it('reports "unconfigured" status without Supabase env vars', async () => {
    const { getRealtimeProvider } = await import('@/lib/realtime/provider');
    const provider = getRealtimeProvider('R64-TEST1');
    await provider.connect('R64-TEST1', 'player-1');
    expect(provider.status()).toBe('unconfigured');
  });

  it('never delivers a move when unconfigured (no fake sync)', async () => {
    const { getRealtimeProvider } = await import('@/lib/realtime/provider');
    const provider = getRealtimeProvider('R64-TEST2');
    await provider.connect('R64-TEST2', 'player-1');
    const sent = await provider.sendMove({
      gameId: 'R64-TEST2',
      fen: 'startpos',
      from: 'e2',
      to: 'e4',
      movedBy: 'player-1',
      timestamp: Date.now()
    });
    expect(sent).toBe(false);
  });

  it('returns the same provider instance for the same room key', async () => {
    const { getRealtimeProvider } = await import('@/lib/realtime/provider');
    const a = getRealtimeProvider('R64-SAME1');
    const b = getRealtimeProvider('R64-SAME1');
    expect(a).toBe(b);
  });

  it('returns a different provider instance for a different room key', async () => {
    const { getRealtimeProvider } = await import('@/lib/realtime/provider');
    const a = getRealtimeProvider('R64-ROOMA');
    const b = getRealtimeProvider('R64-ROOMB');
    expect(a).not.toBe(b);
  });
});
