'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, X, Check } from 'lucide-react';
import { buildJoinUrl } from '@/lib/chess/gameId';

interface RoomShareModalProps {
  gameId: string;
  onClose: () => void;
}

export function RoomShareModal({ gameId, onClose }: RoomShareModalProps) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://royal64.app';
  const joinUrl = buildJoinUrl(gameId, origin);

  async function handleCopy() {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Royal64 game',
          text: `Join my chess game on Royal64 — Game ID ${gameId}`,
          url: joinUrl
        });
        return;
      } catch {
        // user cancelled share sheet — fall through to copy
      }
    }
    handleCopy();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-950/85 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-walnut-800 bg-[url('/textures/wood-grain.svg')] bg-cover border border-gold-500/40 rounded-2xl p-6 w-full max-w-sm shadow-panel relative"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 text-parchment-300/70 hover:text-parchment-100"
          >
            <X size={18} />
          </button>

          <h2 className="font-display text-xl text-parchment-100 text-center mb-1">
            Invite an Opponent
          </h2>
          <p className="text-center text-parchment-300/70 text-sm mb-4">
            Scan the code or share the Game ID
          </p>

          <div className="bg-ivory rounded-xl p-4 flex items-center justify-center mb-4">
            <QRCodeSVG value={joinUrl} size={180} fgColor="#241a12" bgColor="#f8f1e4" />
          </div>

          <div className="bg-espresso-900 rounded-lg px-4 py-3 flex items-center justify-between mb-4">
            <span className="font-mono text-gold-400 text-lg tracking-widest">{gameId}</span>
            <button
              onClick={handleCopy}
              aria-label="Copy game ID"
              className="text-parchment-200 hover:text-gold-400"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium py-2.5 rounded-lg transition-colors"
          >
            <Share2 size={16} /> Share Game
          </button>

          {copied && (
            <p className="text-center text-emerald-400 text-xs mt-2">Game link copied.</p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
