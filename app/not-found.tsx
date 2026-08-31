import Link from 'next/link';
import { Crown } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-espresso-950 px-6 text-center">
      <div>
        <Crown className="mx-auto mb-4 text-gold-400" size={36} />
        <h1 className="font-display text-3xl text-parchment-100 mb-2">Di Luar Papan</h1>
        <p className="text-parchment-300/70 mb-6">
          Petak ini tidak ada di papan Royal64. Yuk kembali ke lobi.
        </p>
        <Link
          href="/dashboard"
          className="bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium px-5 py-2.5 rounded-lg"
        >
          Kembali ke Dasbor
        </Link>
      </div>
    </main>
  );
}
