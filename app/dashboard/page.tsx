import { HeroSection } from '@/components/dashboard/HeroSection';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ChessKnowledge } from '@/components/dashboard/ChessKnowledge';
import { ThemeSelector } from '@/components/dashboard/ThemeSelector';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { PlayerNameCard } from '@/components/dashboard/PlayerNameCard';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <main className="flex-1 pb-20 lg:pb-0">
        <HeroSection />
        <div className="max-w-5xl mx-auto px-6 pt-10">
          <h2 className="font-display text-2xl text-parchment-100">Welcome to Royal64</h2>
          <p className="text-parchment-300/70 mt-2 max-w-2xl">
            This is your lobby — jump into a game, check your recent matches, or tune
            the club to your taste before you sit down at the board.
          </p>
        </div>
        <QuickActions />
        <PlayerNameCard />
        <ChessKnowledge />
        <div id="settings">
          <ThemeSelector />
        </div>
      </main>
    </div>
  );
}
