'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Royal64 error boundary caught:', error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-espresso-950 px-6 text-center">
      <div className="max-w-sm">
        <AlertTriangle className="mx-auto mb-4 text-mahogany-500" size={36} />
        <h1 className="font-display text-2xl text-parchment-100 mb-2">
          Papan Tergelincir
        </h1>
        <p className="text-parchment-300/70 mb-6">
          Ada yang salah saat menampilkan bagian ini dari Royal64. Progres permainanmu
          tidak hilang — coba lagi.
        </p>
        <button
          onClick={reset}
          className="bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium px-5 py-2.5 rounded-lg"
        >
          Coba Lagi
        </button>
      </div>
    </main>
  );
}
