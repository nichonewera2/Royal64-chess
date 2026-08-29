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

export function buildJoinUrl(gameId: string, origin: string): string {
  return `${origin}/game/${encodeURIComponent(gameId)}`;
}
