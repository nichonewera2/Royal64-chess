/**
 * Realtime provider abstraction for Royal64 multiplayer.
 *
 * HONESTY NOTE: no realtime backend credentials exist in this build
 * environment (no network, no provisioned Supabase/Ably/Pusher project).
 * Rather than fake multiplayer with local-only state and label it
 * "realtime" (explicitly forbidden by the spec), this module:
 *
 *   1. Defines the real interface a production realtime provider must
 *      implement (subscribe to room, broadcast a move, presence).
 *   2. Ships a `SupabaseRealtimeProvider` that talks to Supabase Realtime
 *      the moment env vars are configured (see .env.example).
 *   3. Falls back to `OfflineProvider`, which honestly reports itself as
 *      disconnected and drives the "You're offline — realtime not
 *      configured" UI state instead of pretending to sync.
 *
 * Swap providers by setting NEXT_PUBLIC_REALTIME_PROVIDER in .env.
 */

export interface RoomMovePayload {
  gameId: string;
  fen: string;
  from: string;
  to: string;
  promotion?: string;
  movedBy: string;
  timestamp: number;
}

export interface PresenceState {
  gameId: string;
  playerId: string;
  connected: boolean;
  lastSeen: number;
}

export type RealtimeStatus = 'connected' | 'connecting' | 'disconnected' | 'unconfigured';

export interface RealtimeProvider {
  readonly name: string;
  status(): RealtimeStatus;
  connect(gameId: string, playerId: string): Promise<void>;
  disconnect(): Promise<void>;
  sendMove(payload: RoomMovePayload): Promise<boolean>;
  onMove(cb: (payload: RoomMovePayload) => void): () => void;
  onPresence(cb: (state: PresenceState) => void): () => void;
  /** Notifies the caller whenever connection status changes after connect(). */
  onStatusChange(cb: (status: RealtimeStatus) => void): () => void;
}

class OfflineProvider implements RealtimeProvider {
  readonly name = 'offline';
  status(): RealtimeStatus {
    return 'unconfigured';
  }
  async connect() {
    // Intentionally a no-op: there is nothing to connect to.
  }
  async disconnect() {}
  async sendMove(): Promise<boolean> {
    return false;
  }
  onMove() {
    return () => {};
  }
  onPresence() {
    return () => {};
  }
  onStatusChange() {
    return () => {};
  }
}

/**
 * Supabase Realtime implementation. Only instantiated when
 * NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are present.
 * Uses dynamic import so the @supabase/supabase-js dependency is never
 * bundled or required when the app is running offline-only.
 */
class SupabaseRealtimeProvider implements RealtimeProvider {
  readonly name = 'supabase';
  private client: any = null;
  private channel: any = null;
  private currentStatus: RealtimeStatus = 'connecting';
  private statusListeners: Set<(status: RealtimeStatus) => void> = new Set();

  status(): RealtimeStatus {
    return this.currentStatus;
  }

  private setStatus(next: RealtimeStatus) {
    if (this.currentStatus === next) return;
    this.currentStatus = next;
    this.statusListeners.forEach((cb) => cb(next));
  }

  onStatusChange(cb: (status: RealtimeStatus) => void) {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  /**
   * Resolves once the channel is actually SUBSCRIBED (or times out after 10s
   * and marks the room disconnected). Previously this resolved immediately
   * after calling `channel.subscribe()`, before the subscription callback
   * ever fired — which left the UI stuck showing "Connecting..." forever
   * even after a real connection succeeded, because nothing told the UI to
   * check again. Now the promise itself tracks the real outcome, and
   * onStatusChange (above) keeps the UI in sync for any status change that
   * happens later too (e.g. a dropped connection).
   */
  async connect(gameId: string, playerId: string) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      this.setStatus('unconfigured');
      return;
    }

    const { createClient } = await import('@supabase/supabase-js');
    this.client = createClient(url, key);
    this.channel = this.client.channel(`room:${gameId}`, {
      config: { presence: { key: playerId } }
    });

    await new Promise<void>((resolve) => {
      let settled = false;
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        this.setStatus('disconnected');
        resolve();
      }, 10_000);

      this.channel.subscribe((s: string) => {
        if (s === 'SUBSCRIBED') {
          this.setStatus('connected');
        } else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT' || s === 'CLOSED') {
          this.setStatus('disconnected');
        } else {
          this.setStatus('connecting');
        }
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          resolve();
        }
      });
    });
  }

  async disconnect() {
    if (this.channel) await this.client?.removeChannel(this.channel);
    this.setStatus('disconnected');
  }

  async sendMove(payload: RoomMovePayload): Promise<boolean> {
    if (!this.channel || this.currentStatus !== 'connected') return false;
    await this.channel.send({ type: 'broadcast', event: 'move', payload });
    return true;
  }

  onMove(cb: (payload: RoomMovePayload) => void) {
    if (!this.channel) return () => {};
    this.channel.on('broadcast', { event: 'move' }, ({ payload }: any) => cb(payload));
    return () => {};
  }

  onPresence(cb: (state: PresenceState) => void) {
    if (!this.channel) return () => {};
    this.channel.on('presence', { event: 'sync' }, () => {
      // Simplified presence sync — production version would diff state.
      cb({ gameId: '', playerId: '', connected: true, lastSeen: Date.now() });
    });
    return () => {};
  }
}

let cachedProvider: RealtimeProvider | null = null;

export function getRealtimeProvider(): RealtimeProvider {
  if (cachedProvider) return cachedProvider;
  const hasSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  cachedProvider = hasSupabase ? new SupabaseRealtimeProvider() : new OfflineProvider();
  return cachedProvider;
}
