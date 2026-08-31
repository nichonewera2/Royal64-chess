'use client';

import Link from 'next/link';
import { Cpu, Plus, LogIn, ScanLine, Puzzle, Users, Eye } from 'lucide-react';

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
      className="group flex flex-col gap-2 chrome-bg-card bg-[url('/textures/wood-grain.svg')] bg-cover bg-blend-multiply border chrome-border hover:border-gold-500/60 rounded-xl p-5 transition-colors shadow-sm"
    >
      <span className="w-10 h-10 rounded-lg bg-mahogany-600/30 text-gold-400 flex items-center justify-center group-hover:bg-mahogany-600/60 transition-colors">
        {icon}
      </span>
      <h3 className="font-display text-lg chrome-text">{title}</h3>
      <p className="text-sm chrome-text-muted">{description}</p>
    </Link>
  );
}

export function QuickActions() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="font-display text-2xl chrome-text mb-4">Main Cepat</h2>
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <ActionCard
          href="/game?mode=computer"
          icon={<Cpu size={20} />}
          title="Lawan Komputer"
          description="Tantang Royal64 AI di tiga tingkat kesulitan."
        />
        <ActionCard
          href="/game?mode=create"
          icon={<Plus size={20} />}
          title="Buat Ruang"
          description="Buat ruang dan undang teman lewat ID atau kode QR."
        />
        <ActionCard
          href="/game?mode=join"
          icon={<LogIn size={20} />}
          title="Gabung Ruang"
          description="Masukkan Game ID untuk langsung masuk ruang."
        />
      </div>

      <h2 className="font-display text-2xl chrome-text mb-4">Main Bersama</h2>
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <ActionCard
          href="/game?mode=create"
          icon={<Users size={20} />}
          title="Buat Ruang Baru"
          description="Buat Game ID baru untuk pertandingan baru."
        />
        <ActionCard
          href="/game?mode=join"
          icon={<LogIn size={20} />}
          title="Gabung dengan ID"
          description="Masukkan Game ID milik teman (mis. R64-X7K9P)."
        />
        <ActionCard
          href="/game?mode=watch"
          icon={<Eye size={20} />}
          title="Tonton Pertandingan"
          description="Masukkan Game ID untuk menonton tanpa ikut bermain."
        />
      </div>

      <h2 className="font-display text-2xl chrome-text mb-4">Latihan</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <ActionCard
          href="/game?mode=puzzle"
          icon={<Puzzle size={20} />}
          title="Mode Puzzle"
          description="Asah taktikmu dengan posisi-posisi pilihan."
        />
        <ActionCard
          href="/game?mode=local"
          icon={<Users size={20} />}
          title="Lokal 2 Pemain"
          description="Main catur bergantian di satu papan, satu perangkat."
        />
      </div>
    </section>
  );
}
