'use client';

import { create } from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

type ToastTone = 'info' | 'success' | 'error';

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastStoreState {
  toasts: ToastItem[];
  push: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToastStore = create<ToastStoreState>((set) => ({
  toasts: [],
  push: (message, tone = 'info') =>
    set((s) => {
      const id = counter++;
      setTimeout(() => {
        set((s2) => ({ toasts: s2.toasts.filter((t) => t.id !== id) }));
      }, 3200);
      return { toasts: [...s.toasts, { id, message, tone }] };
    }),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
}));

const ICONS: Record<ToastTone, JSX.Element> = {
  info: <Info size={16} />,
  success: <CheckCircle2 size={16} />,
  error: <AlertCircle size={16} />
};

const TONE_CLASSES: Record<ToastTone, string> = {
  info: 'border-gold-500/50 text-parchment-100',
  success: 'border-emerald-500/60 text-emerald-300',
  error: 'border-red-500/60 text-red-300'
};

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            role="status"
            className={`flex items-center gap-2 bg-espresso-900/95 border ${TONE_CLASSES[t.tone]} rounded-full px-4 py-2 text-sm shadow-panel backdrop-blur`}
          >
            {ICONS[t.tone]}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
