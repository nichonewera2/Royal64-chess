'use client';

import { Circle } from 'lucide-react';

interface PlayerNameplateProps {
  name: string;
  color: 'w' | 'b';
  isActive: boolean;
  isYou?: boolean;
}

export function PlayerNameplate({ name, color, isActive, isYou }: PlayerNameplateProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-3.5 h-3.5 rounded-full border ${
          color === 'w' ? 'bg-ivory border-parchment-300' : 'bg-espresso-950 border-parchment-300/60'
        } ${isActive ? 'ring-2 ring-gold-400 ring-offset-1 ring-offset-espresso-900' : ''}`}
        aria-hidden
      />
      <span className="font-player text-xl text-parchment-100 tracking-wide leading-none">
        {name}
      </span>
      {isYou && (
        <span className="text-[10px] uppercase tracking-widest text-gold-500/70 font-body">
          (Kamu)
        </span>
      )}
      {isActive && <Circle size={7} className="fill-gold-400 text-gold-400 animate-pulse" />}
    </div>
  );
}
