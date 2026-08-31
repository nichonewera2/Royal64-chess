'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { useGameStore } from '@/lib/store/gameStore';

export default function GameSegmentError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const resetGame = useGameStore((s) => s.resetGame);

  useEffect(() => {
    console.error('Royal64 chess engine error:', error);
  }, [error]);

  function handleRecover() {
    resetGame('local');
    reset();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-espresso-950 px-6 text-center">
      <div className="max-w-sm">
        <ShieldAlert className="mx-auto mb-4 text-mahogany-500" size={36} />
        <h1 className="font-display text-2xl text-parchment-100 mb-2">
          Mesin Catur Tersandung
        </h1>
        <p className="text-parchment-300/70 mb-6">
          Ada yang salah di tengah permainan. Ini hanya memengaruhi papan — bagian
          Royal64 lainnya tetap aman. Memulai permainan baru akan membersihkannya.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleRecover}
            className="bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium px-5 py-2.5 rounded-lg"
          >
            Mulai Permainan Baru
          </button>
          <Link href="/dashboard" className="text-parchment-300/70 underline text-sm">
            Kembali ke Dasbor
          </Link>
        </div>
      </div>
    </main>
  );
}
