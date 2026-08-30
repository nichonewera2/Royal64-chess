'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Loader2, UserPlus, Crown, XCircle, Share2 } from 'lucide-react';
import { buildJoinUrl } from '@/lib/chess/gameId';

interface PendingRequest {
  playerId: string;
  name: string;
}

interface HostLobbyProps {
  gameId: string;
  pendingRequests: PendingRequest[];
  onAccept: (playerId: string) => void;
  onDecline: (playerId: string) => void;
}

export function HostLobby({ gameId, pendingRequests, onAccept, onDecline }: HostLobbyProps) {
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
          title: 'Gabung game Royal64 saya',
          text: `Ayo main catur — Game ID ${gameId}`,
          url: joinUrl
        });
        return;
      } catch {
        // dibatalkan pengguna — lanjut ke fallback salin link
      }
    }
    handleCopy();
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-5 py-6">
      <div className="flex flex-col items-center gap-2">
        <span className="w-14 h-14 rounded-full border-2 border-gold-500 flex items-center justify-center">
          <Crown className="text-gold-400" size={26} />
        </span>
        <h2 className="font-display text-2xl text-parchment-100">Ruangmu Siap</h2>
        <p className="text-parchment-300/70 text-sm text-center">
          Bagikan QR atau kode ini ke lawanmu untuk mulai bertanding.
        </p>
      </div>

      <div className="bg-ivory rounded-2xl p-4 shadow-board">
        <QRCodeSVG value={joinUrl} size={190} fgColor="#0f0a06" bgColor="#faf1de" />
      </div>

      <div className="w-full bg-espresso-900 border border-walnut-700 rounded-lg px-4 py-3 flex items-center justify-between">
        <span className="font-mono text-gold-400 text-xl tracking-widest">{gameId}</span>
        <button onClick={handleCopy} aria-label="Salin kode" className="text-parchment-200 hover:text-gold-400">
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>

      <button
        onClick={handleShare}
        className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium py-2.5 rounded-lg transition-colors"
      >
        <Share2 size={16} /> Bagikan Undangan
      </button>

      <AnimatePresence mode="wait">
        {pendingRequests.length === 0 ? (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-parchment-300/70 text-sm mt-1"
          >
            <Loader2 size={16} className="animate-spin text-gold-400" />
            Menunggu pemain bergabung…
          </motion.div>
        ) : (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col gap-2"
          >
            {pendingRequests.map((req) => (
              <motion.div
                key={req.playerId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between gap-3 bg-[url('/textures/wood-grain.svg')] bg-cover bg-blend-multiply bg-walnut-800 border-2 border-gold-500/50 rounded-xl px-4 py-3 shadow-panel"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-9 h-9 shrink-0 rounded-full bg-mahogany-600/40 text-gold-400 flex items-center justify-center">
                    <UserPlus size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-player text-lg text-parchment-100 truncate leading-tight">
                      {req.name}
                    </p>
                    <p className="text-[11px] text-parchment-300/60">ingin bergabung melawanmu</p>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => onAccept(req.playerId)}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                  >
                    <Check size={14} /> Ya
                  </button>
                  <button
                    onClick={() => onDecline(req.playerId)}
                    className="flex items-center gap-1 bg-espresso-800 hover:bg-mahogany-600 text-parchment-200 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                  >
                    <XCircle size={14} /> Tidak
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface JoinerLobbyProps {
  status: 'waiting' | 'declined';
  hostSeenOnline: boolean;
}

export function JoinerLobby({ status, hostSeenOnline }: JoinerLobbyProps) {
  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 py-16 text-center">
      {status === 'waiting' ? (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            className="w-14 h-14 rounded-full border-2 border-gold-500 border-t-transparent flex items-center justify-center"
          >
            <Loader2 className="text-gold-400" size={22} />
          </motion.span>
          <h2 className="font-display text-xl text-parchment-100">Menunggu Tuan Rumah</h2>
          <p className="text-parchment-300/70 text-sm">
            Permintaanmu untuk bergabung sudah terkirim. Begitu tuan rumah menekan{' '}
            <span className="text-gold-400 font-medium">Ya</span>, papan catur akan terbuka
            otomatis di layarmu.
          </p>
          {!hostSeenOnline && (
            <p className="text-xs text-parchment-300/50 italic">
              Menghubungkan ke tuan rumah…
            </p>
          )}
        </>
      ) : (
        <>
          <span className="w-14 h-14 rounded-full border-2 border-red-500 flex items-center justify-center">
            <XCircle className="text-red-400" size={26} />
          </span>
          <h2 className="font-display text-xl text-parchment-100">Permintaan Ditolak</h2>
          <p className="text-parchment-300/70 text-sm">
            Tuan rumah belum menerima permintaan bergabungmu. Coba lagi nanti atau minta
            kode/QR baru.
          </p>
        </>
      )}
    </div>
  );
}
