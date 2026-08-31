'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Clock, Infinity as InfinityIcon, Dices } from 'lucide-react';

export type HostColorChoice = 'w' | 'b' | 'random';
/** Minutes per side, or null for no time limit. */
export type TimeControlChoice = number | null;

export interface RoomSetupResult {
  hostColor: 'w' | 'b';
  timeControlMs: number | null;
}

interface RoomSetupProps {
  onConfirm: (result: RoomSetupResult) => void;
}

const COLOR_OPTIONS: Array<{ value: HostColorChoice; label: string; glyph: string }> = [
  { value: 'w', label: 'Putih', glyph: '♔' },
  { value: 'random', label: 'Acak', glyph: '?' },
  { value: 'b', label: 'Hitam', glyph: '♚' }
];

const TIME_OPTIONS: Array<{ value: TimeControlChoice; label: string }> = [
  { value: null, label: 'Tanpa Batas' },
  { value: 3, label: '3 menit' },
  { value: 5, label: '5 menit' },
  { value: 10, label: '10 menit' },
  { value: 15, label: '15 menit' },
  { value: 30, label: '30 menit' }
];

export function RoomSetup({ onConfirm }: RoomSetupProps) {
  const [color, setColor] = useState<HostColorChoice>('w');
  const [minutes, setMinutes] = useState<TimeControlChoice>(10);

  function handleConfirm() {
    const hostColor: 'w' | 'b' = color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : color;
    const timeControlMs = minutes === null ? null : minutes * 60 * 1000;
    onConfirm({ hostColor, timeControlMs });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto flex flex-col gap-6 py-6"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="w-14 h-14 rounded-full border-2 border-gold-500 flex items-center justify-center">
          <Crown className="text-gold-400" size={26} />
        </span>
        <h2 className="font-display text-2xl text-parchment-100">Atur Pertandingan</h2>
        <p className="text-parchment-300/70 text-sm">
          Pilih bidakmu dan batas waktu sebelum ruang dibuat.
        </p>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-wide text-parchment-300/60 mb-2.5">
          Pilih Bidak Anda
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          {COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setColor(opt.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-4 transition-colors ${
                color === opt.value
                  ? 'border-gold-500 bg-gold-500/10'
                  : 'border-walnut-700 bg-espresso-900/50 hover:border-gold-500/40'
              }`}
            >
              <span
                className={`text-3xl leading-none ${
                  opt.value === 'w'
                    ? 'text-ivory'
                    : opt.value === 'b'
                      ? 'text-parchment-100'
                      : 'text-gold-400'
                }`}
              >
                {opt.value === 'random' ? <Dices size={28} /> : opt.glyph}
              </span>
              <span className="text-xs text-parchment-200">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-wide text-parchment-300/60 mb-2.5 flex items-center gap-1.5">
          <Clock size={13} /> Batas Waktu per Pemain
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setMinutes(opt.value)}
              className={`flex items-center justify-center gap-1.5 rounded-lg border-2 py-2.5 text-sm transition-colors ${
                minutes === opt.value
                  ? 'border-gold-500 bg-gold-500/10 text-gold-300'
                  : 'border-walnut-700 bg-espresso-900/50 text-parchment-200 hover:border-gold-500/40'
              }`}
            >
              {opt.value === null && <InfinityIcon size={14} />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleConfirm}
        className="w-full bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium py-3 rounded-lg transition-colors"
      >
        Buat Ruang
      </button>
    </motion.div>
  );
}
