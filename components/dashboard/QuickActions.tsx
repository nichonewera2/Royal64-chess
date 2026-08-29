'use client';

import Link from 'next/link';
import { Cpu, Plus, LogIn, ScanLine, Puzzle, Users } from 'lucide-react';

interface ActionCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ActionCard({ href, icon, title, description }: ActionCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 bg-espresso-800/70 border border-walnut-700 hover:border-gold-500/60 rounded-xl p-5 transition-colors"
    >
      <span className="w-10 h-10 rounded-lg bg-mahogany-600/30 text-gold-400 flex items-center justify-center group-hover:bg-mahogany-600/60 transition-colors">
        {icon}
      </span>
      <h3 className="font-display text-lg text-parchment-100">{title}</h3>
      <p className="text-sm text-parchment-300/70">{description}</p>
    </Link>
  );
}

export function QuickActions() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="font-display text-2xl text-parchment-100 mb-4">Quick Play</h2>
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <ActionCard
          href="/game?mode=computer"
          icon={<Cpu size={20} />}
          title="Play vs Computer"
          description="Challenge the Royal64 AI at three difficulty levels."
        />
        <ActionCard
          href="/game?mode=create"
          icon={<Plus size={20} />}
          title="Create Game"
          description="Start a room and invite a friend by ID or QR code."
        />
        <ActionCard
          href="/game?mode=join"
          icon={<LogIn size={20} />}
          title="Join Game"
          description="Enter a Game ID to jump straight into a room."
        />
      </div>

      <h2 className="font-display text-2xl text-parchment-100 mb-4">Multiplayer</h2>
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <ActionCard
          href="/game?mode=create"
          icon={<Users size={20} />}
          title="Create Room"
          description="Generate a fresh Game ID for a new match."
        />
        <ActionCard
          href="/game?mode=join"
          icon={<LogIn size={20} />}
          title="Join with ID"
          description="Type in a friend's Game ID (e.g. R64-X7K9P)."
        />
        <ActionCard
          href="/game?mode=scan"
          icon={<ScanLine size={20} />}
          title="Scan QR"
          description="Use your camera to scan a room's QR invite."
        />
      </div>

      <h2 className="font-display text-2xl text-parchment-100 mb-4">Practice</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <ActionCard
          href="/game?mode=puzzle"
          icon={<Puzzle size={20} />}
          title="Puzzle Mode"
          description="Sharpen your tactics with curated positions."
        />
        <ActionCard
          href="/game?mode=local"
          icon={<Users size={20} />}
          title="Local 2 Player"
          description="Pass-and-play chess on one board, one device."
        />
      </div>
    </section>
  );
}
