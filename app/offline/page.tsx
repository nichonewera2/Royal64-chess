import Link from 'next/link';
import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-espresso-950 px-6 text-center">
      <div className="max-w-sm">
        <WifiOff className="mx-auto mb-4 text-gold-400" size={36} />
        <h1 className="font-display text-2xl text-parchment-100 mb-2">You're offline</h1>
        <p className="text-parchment-300/70 mb-6">
          Royal64 can't reach the network right now. Local modes still work —
          you can keep playing against the computer or pass-and-play locally.
          Online multiplayer will reconnect automatically once you're back.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href="/game?mode=computer"
            className="bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium px-5 py-2.5 rounded-lg"
          >
            Play vs Computer
          </Link>
          <Link
            href="/dashboard"
            className="border border-parchment-200/30 text-parchment-100 px-5 py-2.5 rounded-lg"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
