/**
 * Generates a dynamic Room/Game ID in the form R64-XXXXX.
 * Never hardcoded — pulled from crypto-strength randomness each call.
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)

export function generateGameId(): string {
  const bytes = new Uint8Array(5);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let suffix = '';
  for (const b of bytes) {
    suffix += ALPHABET[b % ALPHABET.length];
  }
  return `R64-${suffix}`;
}

export function isValidGameId(id: string): boolean {
  return /^R64-[A-Z2-9]{5}$/.test(id.trim().toUpperCase());
}

/**
 * Builds the link shared via QR/copy for whoever JOINS the room — always
 * seated as the opposite color from whatever the host picked in
 * RoomSetup, and carrying the same time control so both clocks start in
 * sync. `time` is encoded as minutes, or the literal "none" for no limit.
 */
export function buildJoinUrl(
  gameId: string,
  origin: string,
  joinerSeat: 'w' | 'b',
  timeControlMs: number | null
): string {
  const timeParam = timeControlMs === null ? 'none' : String(Math.round(timeControlMs / 60000));
  return `${origin}/game/${encodeURIComponent(gameId)}?seat=${joinerSeat}&time=${timeParam}`;
}

/**
 * Builds the host's OWN room URL right after they finish RoomSetup — marks
 * them as host (shows the waiting-room/approval lobby) and seats them in
 * the color they picked.
 */
export function buildHostUrl(
  gameId: string,
  hostSeat: 'w' | 'b',
  timeControlMs: number | null
): string {
  const timeParam = timeControlMs === null ? 'none' : String(Math.round(timeControlMs / 60000));
  return `/game/${encodeURIComponent(gameId)}?host=1&seat=${hostSeat}&time=${timeParam}`;
}

/** Parses the `time` query param back into ms (null = no limit). */
export function parseTimeControlParam(value: string | null): number | null {
  if (!value || value === 'none') return null;
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  return minutes * 60 * 1000;
}
