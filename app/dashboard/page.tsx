import { HeroSection } from '@/components/dashboard/HeroSection';
import { FeatureStrip } from '@/components/dashboard/FeatureStrip';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ChessKnowledge } from '@/components/dashboard/ChessKnowledge';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { PlayerNameCard } from '@/components/dashboard/PlayerNameCard';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <main className="flex-1 pb-20 lg:pb-0">
        <HeroSection />
        <FeatureStrip />
        <div className="max-w-5xl mx-auto px-6 pt-2">
          <h2 className="font-display text-2xl chrome-text">Selamat Datang di Royal64</h2>
          <p className="chrome-text-muted mt-2 max-w-2xl">
            Ini lobimu — langsung main, cek pertandinganmu, atau atur suasana klub
            sesuai seleramu sebelum duduk di depan papan.
          </p>
        </div>
        <QuickActions />
        <div id="settings">
          <PlayerNameCard />
        </div>
        <ChessKnowledge />
      </main>
    </div>
  );
}
