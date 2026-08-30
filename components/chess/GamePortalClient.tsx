'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Cpu, Users, LogIn, Plus, ScanLine, Puzzle, ArrowLeft } from 'lucide-react';
import { ComputerGame } from './ComputerGame';
import { LocalGame } from './LocalGame';
import { RoomShareModal } from './RoomShareModal';
import { generateGameId, isValidGameId } from '@/lib/chess/gameId';
import { useToastStore } from '@/components/ui/Toast';

type PortalMode = 'menu' | 'computer' | 'local' | 'create' | 'join' | 'scan' | 'puzzle';

const MODE_CARDS: Array<{ mode: PortalMode; icon: React.ReactNode; title: string; group: string }> = [
  { mode: 'create', icon: <Plus size={20} />, title: 'Create Game', group: 'Play Online' },
  { mode: 'join', icon: <LogIn size={20} />, title: 'Join Game', group: 'Play Online' },
  { mode: 'scan', icon: <ScanLine size={20} />, title: 'Scan QR', group: 'Play Online' },
  { mode: 'computer', icon: <Cpu size={20} />, title: 'Play vs Computer', group: 'Play Offline' },
  { mode: 'local', icon: <Users size={20} />, title: 'Local 2 Player', group: 'Play Offline' },
  { mode: 'puzzle', icon: <Puzzle size={20} />, title: 'Puzzle Mode', group: 'Practice' }
];

export function GamePortalClient({ initialMode }: { initialMode?: string }) {
  const [mode, setMode] = useState<PortalMode>(
    (initialMode as PortalMode) && MODE_CARDS.some((c) => c.mode === initialMode)
      ? (initialMode as PortalMode)
      : 'menu'
  );
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [joinInput, setJoinInput] = useState('');
  const router = useRouter();
  const push = useToastStore((s) => s.push);

  function handleCreate() {
    const id = generateGameId();
    setCreatedId(id);
  }

  function handleJoin() {
    const trimmed = joinInput.trim().toUpperCase();
    if (!isValidGameId(trimmed)) {
      push('That game could not be found.', 'error');
      return;
    }
    router.push(`/game/${trimmed}?seat=b`);
  }

  if (mode === 'computer') return <PortalShell title="Vs Computer"><ComputerGame /></PortalShell>;
  if (mode === 'local') return <PortalShell title="Local 2 Player"><LocalGame /></PortalShell>;

  if (mode === 'puzzle') {
    return (
      <PortalShell title="Puzzle Mode">
        <div className="text-center text-parchment-300/70 max-w-md mx-auto py-16">
          <Puzzle className="mx-auto mb-4 text-gold-400" size={32} />
          <p>
            Puzzle mode is coming to Royal64 soon — curated tactics with graded
            difficulty. For now, sharpen up in Local 2 Player or against the AI.
          </p>
        </div>
      </PortalShell>
    );
  }

  if (mode === 'scan') {
    return (
      <PortalShell title="Scan QR">
        <div className="text-center text-parchment-300/70 max-w-md mx-auto py-16">
          <ScanLine className="mx-auto mb-4 text-gold-400" size={32} />
          <p>
            Camera-based QR scanning requires camera permission this preview
            environment can&apos;t grant. Use{' '}
            <button className="underline text-gold-400" onClick={() => setMode('join')}>
              Join with ID
            </button>{' '}
            instead, or scan the code with your phone&apos;s native camera app — it
            will open the join link directly.
          </p>
        </div>
      </PortalShell>
    );
  }

  if (mode === 'create') {
    return (
      <PortalShell title="Create Game">
        <div className="text-center max-w-md mx-auto py-16">
          {!createdId ? (
            <button
              onClick={handleCreate}
              className="bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium px-6 py-3 rounded-lg"
            >
              Generate Game ID
            </button>
          ) : (
            <RoomShareModal gameId={createdId} onClose={() => router.push(`/game/${createdId}`)} />
          )}
        </div>
      </PortalShell>
    );
  }

  if (mode === 'join') {
    return (
      <PortalShell title="Join Game">
        <div className="max-w-sm mx-auto py-16 flex flex-col gap-3">
          <label className="text-sm text-parchment-300/70" htmlFor="gameId">
            Game ID
          </label>
          <input
            id="gameId"
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value)}
            placeholder="R64-X7K9P"
            className="bg-espresso-900 border border-walnut-700 focus:border-gold-500 rounded-lg px-4 py-3 font-mono tracking-widest text-parchment-100 outline-none"
          />
          <button
            onClick={handleJoin}
            className="bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium px-4 py-3 rounded-lg"
          >
            Join Game
          </button>
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell title="Royal64 Game Portal">
      {['Play Online', 'Play Offline', 'Practice'].map((group) => (
        <div key={group} className="mb-8">
          <h2 className="font-display text-xl text-parchment-100 mb-3">{group}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {MODE_CARDS.filter((c) => c.group === group).map((c) => (
              <button
                key={c.mode}
                onClick={() => setMode(c.mode)}
                className="flex flex-col items-start gap-2 bg-espresso-800/70 border border-walnut-700 hover:border-gold-500/60 rounded-xl p-5 text-left transition-colors"
              >
                <span className="w-10 h-10 rounded-lg bg-mahogany-600/30 text-gold-400 flex items-center justify-center">
                  {c.icon}
                </span>
                <span className="font-display text-parchment-100">{c.title}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </PortalShell>
  );
}

function PortalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-espresso-950 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-parchment-300/70 hover:text-gold-400">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-display text-2xl text-parchment-100">{title}</h1>
        </div>
        {children}
      </div>
    </main>
  );
}
