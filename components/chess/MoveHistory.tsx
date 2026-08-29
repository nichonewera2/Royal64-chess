'use client';

import { useGameStore } from '@/lib/store/gameStore';

export function MoveHistory() {
  const { moveList } = useGameStore();

  const pairs: Array<[string, string | undefined]> = [];
  for (let i = 0; i < moveList.length; i += 2) {
    pairs.push([moveList[i], moveList[i + 1]]);
  }

  return (
    <div className="bg-espresso-900/60 border border-walnut-700 rounded-lg p-3 max-h-64 overflow-y-auto">
      <h3 className="font-display text-parchment-100 text-sm uppercase tracking-wide mb-2 opacity-80">
        Move History
      </h3>
      {pairs.length === 0 ? (
        <p className="text-parchment-300/60 text-sm italic">No moves yet — history will appear here.</p>
      ) : (
        <ol className="grid grid-cols-[2rem_1fr_1fr] gap-y-1 text-sm font-mono text-parchment-100">
          {pairs.map(([white, black], idx) => (
            <li key={idx} className="contents">
              <span className="text-gold-500/80">{idx + 1}.</span>
              <span>{white}</span>
              <span>{black ?? ''}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
