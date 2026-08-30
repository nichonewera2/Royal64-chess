'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown, Cpu } from 'lucide-react';
import { InstallButton } from '@/components/pwa/InstallButton';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-wood-dark border-b border-gold-500/20 px-6 py-16 sm:py-24">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,#c9a24b_0,transparent_45%)]" />
      <div className="relative max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-16 h-16 rounded-full border-2 border-gold-500 flex items-center justify-center"
        >
          <Crown className="text-gold-400" size={30} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl text-ivory tracking-tight"
        >
          Royal64
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display italic text-xl sm:text-2xl text-gold-400"
        >
          Setiap Langkah Menjadi Sejarah.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-parchment-200/80 max-w-xl"
        >
          Klub catur untuk zaman modern. Main lawan teman satu ruangan atau dari
          belahan dunia lain, tantang Royal64 AI, dan rasakan papan yang dibangun
          dengan kehangatan kayu tua klasik.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-2"
        >
          <Link
            href="/game"
            className="bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Masuk ke Permainan
          </Link>
          <Link
            href="/game?mode=computer"
            className="flex items-center gap-2 border border-parchment-200/30 hover:border-gold-500/60 text-parchment-100 px-6 py-3 rounded-lg transition-colors"
          >
            <Cpu size={16} /> Lawan Komputer
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <InstallButton variant="compact" />
        </motion.div>
      </div>
    </section>
  );
}
