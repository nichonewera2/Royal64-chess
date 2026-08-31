'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Cpu, ChevronDown } from 'lucide-react';
import { InstallButton } from '@/components/pwa/InstallButton';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-wood-dark min-h-[100svh] flex flex-col items-center justify-center px-6 py-20">
      {/* Layered background art — oversized rotated checkerboard bleeding
          off the edges, faded at the perimeter so it reads as texture
          rather than competing with the text on top of it. */}
      <div
        className="absolute -inset-[15%] opacity-[0.07] pointer-events-none bg-repeat"
        style={{
          backgroundImage: "url('/textures/chess-pattern.svg')",
          backgroundSize: '340px 340px',
          transform: 'rotate(8deg)'
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_28%,rgba(240,168,60,0.16)_0%,transparent_55%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-t from-espresso-950 to-transparent" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_180px_60px_rgba(15,10,6,0.75)]" />

      <div className="relative max-w-3xl mx-auto text-center flex flex-col items-center gap-7">
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="w-24 h-24 rounded-full overflow-hidden shadow-[0_0_50px_-8px_rgba(240,168,60,0.6)]"
        >
          <img src="/icons/icon-512.png" alt="Lambang Royal64" className="w-full h-full object-cover" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="font-display text-6xl sm:text-8xl text-ivory tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
        >
          Royal64
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="font-display italic text-2xl sm:text-3xl text-gold-400"
        >
          Setiap Langkah Menjadi Sejarah.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="text-parchment-200/85 max-w-xl text-base sm:text-lg leading-relaxed"
        >
          Klub catur untuk zaman modern. Main lawan teman satu ruangan atau dari
          belahan dunia lain, tantang Royal64 AI, dan rasakan papan yang dibangun
          dengan kehangatan kayu tua klasik.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-2"
        >
          <Link
            href="/game"
            className="bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium px-7 py-3.5 rounded-lg transition-colors shadow-[0_8px_30px_-8px_rgba(240,168,60,0.5)]"
          >
            Masuk ke Permainan
          </Link>
          <Link
            href="/game?mode=computer"
            className="flex items-center gap-2 border border-parchment-200/30 hover:border-gold-500/60 text-parchment-100 px-7 py-3.5 rounded-lg transition-colors"
          >
            <Cpu size={16} /> Lawan Komputer
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.52 }}
        >
          <InstallButton variant="compact" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 0.8 }, y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }}
        className="absolute bottom-7 text-parchment-300/50"
      >
        <ChevronDown size={22} />
      </motion.div>
    </section>
  );
}
