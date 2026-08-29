# ♜ Royal64

**Where Every Move Becomes History.**

Developer: **Nicholas.ofc**

A premium, classic-chocolate-themed chess platform — play a friend in real
time, challenge the Royal64 AI, or pass-and-play locally. Built with
Next.js, TypeScript, Tailwind CSS, and chess.js.

---

## What's real vs. what's an honest stub

This project is built to run and to be genuinely playable end-to-end, but
two pieces are intentionally left as clearly-labeled, swappable seams
rather than faked:

| Feature | Status |
|---|---|
| Chess rules (check, checkmate, castling, en passant, promotion, draws) | **Fully real**, via `chess.js` |
| Computer opponent | **Real minimax/alpha-beta search** with material + positional evaluation, three difficulty levels. Labeled "Royal64 AI" — it is *not* Stockfish. See `lib/chess/computer.ts` for the `ComputerOpponent` interface if you want to drop in a real Stockfish WASM worker later. |
| Local 2-player | **Fully real** |
| Multiplayer rooms, Game ID, QR code, share | **Fully real** — IDs are generated dynamically, QR encodes a real join URL, share uses the Web Share API with clipboard fallback |
| Realtime move sync | **Real Supabase Realtime implementation**, active the moment you set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Without those, the app **honestly shows "not configured"** instead of faking sync — see `lib/realtime/provider.ts` |
| PWA (manifest, service worker, install prompt) | **Fully real** — uses the real `beforeinstallprompt` event, not a fake button |

---

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — it redirects to `/dashboard`.

### Production build

```bash
npm run build
npm start
```

### Tests

```bash
npm run test
```

Covers core chess rules: legal/illegal moves, checkmate detection,
castling, en passant, promotion, and Game ID generation.

---

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Enables real cross-device multiplayer sync |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Enables real cross-device multiplayer sync |
| `NEXT_PUBLIC_APP_URL` | Optional | Used to build absolute join URLs for QR codes |

Royal64 runs fully without any env vars — multiplayer rooms and QR codes
still work, but move sync will show "Realtime provider not configured"
instead of connecting.

`@supabase/supabase-js` is already listed as a dependency (needed so the
build compiles even before you configure it) — it stays inert until the
two env vars above are set.

To wire up real multiplayer:
1. Create a free project at [supabase.com](https://supabase.com)
2. Enable Realtime on your project
3. Set the two env vars above

---

## Deploying to Vercel

```bash
vercel
```

Or import the repository directly in the Vercel dashboard. No special
configuration is needed beyond the optional env vars above — this is a
standard Next.js App Router project.

---

## Project structure

```text
Royal64/
├── app/                  # Next.js App Router routes
│   ├── dashboard/        # Luxury digital lobby (first screen)
│   ├── game/             # Game Portal + [gameId] room + segment error boundary
│   ├── offline/          # Service-worker offline fallback page
│   ├── layout.tsx        # Fonts, metadata, PWA registration
│   ├── error.tsx         # Root error boundary
│   └── not-found.tsx     # Custom 404
├── components/
│   ├── chess/            # Board, pieces, squares, clock, controls, modals
│   ├── dashboard/        # Hero, quick actions, nav, theme selector
│   ├── pwa/              # Install button, service worker registration
│   └── ui/               # Toast notifications (no browser alert())
├── lib/
│   ├── chess/            # Engine wrapper, AI, computer service, Game ID
│   ├── realtime/         # Realtime provider abstraction + Supabase impl
│   └── store/            # Zustand game state store
├── public/
│   ├── icons/            # PWA icons (SVG)
│   ├── manifest.webmanifest
│   └── sw.js             # Service worker (cache strategy + offline)
├── tests/                # Vitest unit tests for chess rules
├── .env.example
└── README.md
```

---

## Security notes

- No hardcoded secrets anywhere in source; Supabase credentials are read
  from environment variables only.
- Game IDs are generated with `crypto.getRandomValues` and validated with
  a strict regex before any room lookup.
- All multiplayer moves are re-validated by the local chess engine before
  being applied — a malicious or corrupted payload from the network
  cannot force an illegal board state client-side. (A production backend
  should additionally validate moves server-side before broadcasting.)
- `.env.local` and `.env` are git-ignored; only `.env.example` (no real
  values) is committed.

## Browser support

Targets current Chrome, Edge, Firefox, Safari, and their mobile
equivalents. Features without broad support (e.g. `navigator.share`,
`beforeinstallprompt`) degrade gracefully to clipboard-copy and manual
install instructions respectively.

## Troubleshooting

- **Install button says "unavailable"**: `beforeinstallprompt` isn't
  fired by Safari/iOS or by browsers where the PWA criteria aren't met
  (HTTPS + valid manifest + registered service worker). Use "Add to Home
  Screen" manually on iOS.
- **Multiplayer shows "not configured"**: see the Supabase setup steps
  above — this is the intended honest fallback, not a bug.
- **TypeScript path alias errors**: confirm `tsconfig.json`'s `paths`
  (`@/*`) match your editor's TS server version.

---

**Royal64**
**Where Every Move Becomes History.**

Developer: **Nicholas.ofc**
