import { GamePortalClient } from '@/components/chess/GamePortalClient';

export default function GamePortalPage({
  searchParams
}: {
  searchParams: { mode?: string };
}) {
  return <GamePortalClient initialMode={searchParams.mode} />;
}
