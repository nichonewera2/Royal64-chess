import Link from 'next/link';
import { Crown } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-espresso-950 px-6 text-center">
      <div>
        <Crown className="mx-auto mb-4 text-gold-400" size={36} />
        <h1 className="font-display text-3xl text-parchment-100 mb-2">Off the board</h1>
        <p className="text-parchment-300/70 mb-6">
          This square doesn&apos;t exist on Royal64&apos;s board. Let&apos;s get you back to the lobby.
        </p>
        <Link
          href="/dashboard"
          className="bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium px-5 py-2.5 rounded-lg"
        >
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}
