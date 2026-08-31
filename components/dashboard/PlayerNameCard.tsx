'use client';

import { useEffect, useState } from 'react';
import { Pencil, User } from 'lucide-react';
import { usePlayerStore } from '@/lib/store/playerStore';
import { NamePromptModal } from '@/components/ui/NamePromptModal';

export function PlayerNameCard() {
  const { name, hydrated, hydrate } = usePlayerStore();
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="font-display text-2xl chrome-text mb-4">Nama Pemain</h2>
      <div className="flex items-center justify-between chrome-bg-card border chrome-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-mahogany-600/30 text-gold-400 flex items-center justify-center">
            <User size={18} />
          </span>
          <span className="font-player text-2xl chrome-text tracking-wide">
            {hydrated ? name ?? '—' : '…'}
          </span>
        </div>
        <button
          onClick={() => setRenaming(true)}
          className="flex items-center gap-2 text-sm chrome-text-muted hover:text-gold-400 border chrome-border hover:border-gold-500/60 rounded-lg px-3 py-2 transition-colors"
        >
          <Pencil size={14} /> Ganti Nama
        </button>
      </div>

      {renaming && <NamePromptModal forceOpen onClose={() => setRenaming(false)} />}
    </section>
  );
}
