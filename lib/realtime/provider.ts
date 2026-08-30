/**
 * Realtime provider abstraction for Royal64 multiplayer, chat, and
 * spectating.
 *
 * HONESTY NOTE: this only becomes a real live connection once
 * NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are set (see
 * .env.local). Without them, `OfflineProvider` honestly reports
 * "unconfigured" instead of faking a connection.
 *
 * DESIGN: everything (moves, chat messages, player identity, presence)
 * rides over ONE Supabase Realtime channel per room, as named broadcast
 * events. `on()`/`send()` are generic; onMove/onChat/onIdentity are thin,
 * typed convenience wrappers over them. Listeners registered via `on()`
 * are stored in a Set *before* the channel exists and re-attached once
 * `connect()` actually creates it — registration order never matters
 * (this fixed a real bug where onMove() calls before connect() finished
 * were silently dropped).
 */

export type RealtimeStatus = 'connected' | 'connecting' | 'disconnected' | 'unconfigured';

export interface RoomMovePayload {
  gameId: string;
  fen: string;
  from: string;
  to: string;
  promotion?: string;
  movedBy: string;
  timestamp: number;
}

export interface ChatMessagePayload {
  id: string;
  gameId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface IdentityPayload {
  playerId: string;
  name: string;
  role: 'w' | 'b' | 'spectator';
}

type EventName = 'move' | 'chat' | 'identity' | 'resign' | 'draw-offer' | 'draw-response';

export interface RealtimeProvider {
  readonly name: string;
  status(): RealtimeStatus;
  connect(gameId: string, playerId: string): Promise<void>;
  disconnect(): Promise<void>;
  send<T = unknown>(event: EventName, payload: T): Promise<boolean>;
  on<T = unknown>(event: EventName, cb: (payload: T) => void): () => void;
  onStatusChange(cb: (status: RealtimeStatus) => void): () => void;

  sendMove(payload: RoomMovePayload): Promise<boolean>;
  onMove(cb: (payload: RoomMovePayload) => void): () => void;
  sendChat(payload: ChatMessagePayload): Promise<boolean>;
  onChat(cb: (payload: ChatMessagePayload) => void): () => void;
  sendIdentity(payload: IdentityPayload): Promise<boolean>;
  onIdentity(cb: (payload: IdentityPayload) => void): () => void;
}

class OfflineProvider implements RealtimeProvider {
  readonly name = 'offline';
  status(): RealtimeStatus {
    return 'unconfigured';
  }
  async connect() {}
  async disconnect() {}
  async send(): Promise<boolean> {
    return false;
  }
  on() {
    return () => {};
  }
  onStatusChange() {
    return () => {};
  }
  async sendMove() {
    return false;
  }
  onMove() {
    return () => {};
  }
  async sendChat() {
    return false;
  }
  onChat() {
    return () => {};
  }
  async sendIdentity() {
    return false;
  }
  onIdentity() {
    return () => {};
  }
}

class SupabaseRealtimeProvider implements RealtimeProvider {
  readonly name = 'supabase';
  private client: any = null;
  private channel: any = null;
  private currentStatus: RealtimeStatus = 'connecting';
  private statusListeners: Set<(status: RealtimeStatus) => void> = new Set();
  private eventListeners: Map<EventName, Set<(payload: any) => void>> = new Map();

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

  on<T = unknown>(event: EventName, cb: (payload: T) => void) {
    if (!this.eventListeners.has(event)) this.eventListeners.set(event, new Set());
    this.eventListeners.get(event)!.add(cb as any);
    return () => this.eventListeners.get(event)?.delete(cb as any);
  }

  async send<T = unknown>(event: EventName, payload: T): Promise<boolean> {
    if (!this.channel || this.currentStatus !== 'connected') return false;
    await this.channel.send({ type: 'broadcast', event, payload });
    return true;
  }

  async connect(gameId: string) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      this.setStatus('unconfigured');
      return;
    }

    const { createClient } = await import('@supabase/supabase-js');
    this.client = createClient(url, key);
    this.channel = this.client.channel(`room:${gameId}`);

    const events: EventName[] = ['move', 'chat', 'identity', 'resign', 'draw-offer', 'draw-response'];
    for (const event of events) {
      this.channel.on('broadcast', { event }, ({ payload }: any) => {
        this.eventListeners.get(event)?.forEach((cb) => cb(payload));
      });
    }

    await new Promise<void>((resolve) => {
      let settled = false;
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        this.setStatus('disconnected');
        resolve();
      }, 10_000);

      this.channel.subscribe((s: string) => {
        if (s === 'SUBSCRIBED') this.setStatus('connected');
        else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT' || s === 'CLOSED') this.setStatus('disconnected');
        else this.setStatus('connecting');

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

  sendMove(payload: RoomMovePayload) {
    return this.send('move', payload);
  }
  onMove(cb: (payload: RoomMovePayload) => void) {
    return this.on<RoomMovePayload>('move', cb);
  }
  sendChat(payload: ChatMessagePayload) {
    return this.send('chat', payload);
  }
  onChat(cb: (payload: ChatMessagePayload) => void) {
    return this.on<ChatMessagePayload>('chat', cb);
  }
  sendIdentity(payload: IdentityPayload) {
    return this.send('identity', payload);
  }
  onIdentity(cb: (payload: IdentityPayload) => void) {
    return this.on<IdentityPayload>('identity', cb);
  }
}

const providerCache: Map<string, RealtimeProvider> = new Map();

/**
 * Returns a realtime provider instance keyed by room. Each room gets its
 * own provider/channel instance so multiple rooms (e.g. a spectator
 * watching one room while a player tab has another open) don't collide.
 */
export function getRealtimeProvider(roomKey: string): RealtimeProvider {
  const cached = providerCache.get(roomKey);
  if (cached) return cached;

  const hasSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const provider = hasSupabase ? new SupabaseRealtimeProvider() : new OfflineProvider();
  providerCache.set(roomKey, provider);
  return provider;
}

export function releaseRealtimeProvider(roomKey: string) {
  providerCache.delete(roomKey);
}
