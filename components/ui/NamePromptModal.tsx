'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check } from 'lucide-react';
import { usePlayerStore } from '@/lib/store/playerStore';

interface NamePromptModalProps {
  /** When true, modal shows regardless of whether a name is already set (rename flow). */
  forceOpen?: boolean;
  onClose?: () => void;
}

export function NamePromptModal({ forceOpen = false, onClose }: NamePromptModalProps) {
  const { name, hydrated, hydrate, setName } = usePlayerStore();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (name) setDraft(name);
  }, [name]);

  const shouldShow = hydrated && (forceOpen || !name);

  useEffect(() => {
    if (shouldShow) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [shouldShow]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (trimmed.length < 2) {
      setError('Nama minimal 2 karakter.');
      return;
    }
    if (trimmed.length > 24) {
      setError('Nama maksimal 24 karakter.');
      return;
    }
    setError(null);
    setName(trimmed);
    onClose?.();
  }

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-espresso-950/90 backdrop-blur-sm px-6"
      >
        <motion.form
          initial={{ scale: 0.92, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-walnut-800 border-2 border-gold-500/40 rounded-2xl p-7 shadow-panel bg-[url('/textures/wood-grain.svg')] bg-cover"
        >
          <div className="flex flex-col items-center gap-2 mb-5 text-center">
            <span className="w-14 h-14 rounded-full border-2 border-gold-500 flex items-center justify-center">
              <Crown className="text-gold-400" size={26} />
            </span>
            <h2 className="font-display text-2xl text-parchment-100">
              {forceOpen ? 'Ganti Nama' : 'Selamat Datang di Royal64'}
            </h2>
            <p className="text-parchment-300/70 text-sm">
              Masukkan nama yang akan tampil di papan catur dan ruang pertandingan.
            </p>
          </div>

          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
            }}
            maxLength={24}
            placeholder="Nama kamu"
            className="w-full bg-espresso-900 border border-walnut-700 focus:border-gold-500 rounded-lg px-4 py-3 font-player text-xl text-parchment-100 outline-none text-center tracking-wide"
          />
          {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full mt-5 flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium py-2.5 rounded-lg transition-colors"
          >
            <Check size={16} /> {forceOpen ? 'Simpan' : 'Masuk ke Royal64'}
          </button>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}
