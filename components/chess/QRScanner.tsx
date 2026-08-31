'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, RefreshCw, AlertTriangle, ScanLine as ScanLineIcon } from 'lucide-react';
import { isValidGameId } from '@/lib/chess/gameId';
import { useToastStore } from '@/components/ui/Toast';

type ScanState = 'idle' | 'requesting' | 'scanning' | 'found' | 'denied' | 'unsupported' | 'error';

/** Extracts a Royal64 room path (+ query) from a scanned URL or raw Game ID text. */
function extractRoomPath(text: string): string | null {
  const trimmed = text.trim();

  // Case 1: the QR encodes a full or relative URL, e.g. https://host/game/R64-ABCDE?seat=b&time=10
  try {
    const url = new URL(trimmed, window.location.origin);
    const parts = url.pathname.split('/').filter(Boolean);
    const gameIdx = parts.indexOf('game');
    if (gameIdx !== -1 && parts[gameIdx + 1]) {
      const candidate = decodeURIComponent(parts[gameIdx + 1]).toUpperCase();
      if (isValidGameId(candidate)) {
        return `/game/${candidate}${url.search}`;
      }
    }
  } catch {
    // Not a URL — fall through to raw-ID handling below.
  }

  // Case 2: the QR (or pasted text) is just the raw Game ID itself. Color
  // and time control aren't known here — the host's approval message
  // resolves both once we're let in (see OnlineGame.tsx resolvedRole).
  const rawCandidate = trimmed.toUpperCase();
  if (isValidGameId(rawCandidate)) {
    return `/game/${rawCandidate}`;
  }

  return null;
}

export function QRScanner() {
  const router = useRouter();
  const push = useToastStore((s) => s.push);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [state, setState] = useState<ScanState>('idle');
  const [manualInput, setManualInput] = useState('');

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });

    if (code && code.data) {
      const path = extractRoomPath(code.data);
      if (path) {
        setState('found');
        stopCamera();
        setTimeout(() => router.push(path), 450);
        return;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [router, stopCamera]);

  const startCamera = useCallback(async () => {
    setState('requesting');
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unsupported');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState('scanning');
      rafRef.current = requestAnimationFrame(tick);
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setState('denied');
      } else {
        setState('error');
      }
    }
  }, [tick]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const path = extractRoomPath(manualInput);
    if (!path) {
      push('Kode itu tidak dikenali. Periksa lagi Game ID-nya.', 'error');
      return;
    }
    stopCamera();
    router.push(path);
  }

  return (
    <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-espresso-950 border-2 border-gold-500/40 shadow-board">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanning frame overlay */}
        {state === 'scanning' && (
          <>
            <div className="absolute inset-8 pointer-events-none">
              <Corner className="top-0 left-0 border-t-4 border-l-4 rounded-tl-lg" />
              <Corner className="top-0 right-0 border-t-4 border-r-4 rounded-tr-lg" />
              <Corner className="bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg" />
              <Corner className="bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg" />
            </div>
            <motion.div
              className="absolute left-8 right-8 h-0.5 bg-gold-400 shadow-[0_0_10px_2px_rgba(240,168,60,0.7)]"
              animate={{ top: ['12%', '88%', '12%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}

        {/* Status overlays */}
        <AnimatePresence>
          {state !== 'scanning' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-espresso-950/90 text-center px-6"
            >
              {state === 'requesting' && (
                <>
                  <Camera className="text-gold-400 animate-pulse" size={32} />
                  <p className="text-parchment-200 text-sm">Meminta izin kamera…</p>
                </>
              )}
              {state === 'found' && (
                <>
                  <ScanLineIcon className="text-emerald-400" size={32} />
                  <p className="text-emerald-300 text-sm">Kode ditemukan — membuka ruang…</p>
                </>
              )}
              {state === 'denied' && (
                <>
                  <CameraOff className="text-red-400" size={32} />
                  <p className="text-parchment-200 text-sm">
                    Izin kamera ditolak. Aktifkan izin kamera untuk situs ini di pengaturan
                    browser, lalu coba lagi — atau masukkan Game ID secara manual di bawah.
                  </p>
                  <button
                    onClick={startCamera}
                    className="flex items-center gap-2 text-xs bg-gold-500 hover:bg-gold-400 text-espresso-950 px-3 py-1.5 rounded-full mt-1"
                  >
                    <RefreshCw size={13} /> Coba Lagi
                  </button>
                </>
              )}
              {state === 'unsupported' && (
                <>
                  <AlertTriangle className="text-red-400" size={32} />
                  <p className="text-parchment-200 text-sm">
                    Browser ini tidak mendukung akses kamera. Gunakan Chrome/Safari terbaru,
                    atau masukkan Game ID secara manual di bawah.
                  </p>
                </>
              )}
              {state === 'error' && (
                <>
                  <AlertTriangle className="text-red-400" size={32} />
                  <p className="text-parchment-200 text-sm">
                    Tidak bisa mengakses kamera. Coba lagi, atau masukkan Game ID secara manual.
                  </p>
                  <button
                    onClick={startCamera}
                    className="flex items-center gap-2 text-xs bg-gold-500 hover:bg-gold-400 text-espresso-950 px-3 py-1.5 rounded-full mt-1"
                  >
                    <RefreshCw size={13} /> Coba Lagi
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-xs text-parchment-300/60 text-center">
        Arahkan kamera ke QR yang dibagikan lawanmu — akan otomatis terbuka begitu terbaca.
      </p>

      <div className="w-full flex items-center gap-2">
        <div className="flex-1 h-px bg-walnut-700" />
        <span className="text-[11px] text-parchment-300/50 uppercase tracking-wide">atau</span>
        <div className="flex-1 h-px bg-walnut-700" />
      </div>

      <form onSubmit={handleManualSubmit} className="w-full flex gap-2">
        <input
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Masukkan Game ID manual"
          className="flex-1 bg-espresso-900 border border-walnut-700 focus:border-gold-500 rounded-lg px-3 py-2 font-mono text-sm text-parchment-100 outline-none tracking-wide"
        />
        <button
          type="submit"
          className="bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium text-sm px-4 py-2 rounded-lg"
        >
          Buka
        </button>
      </form>
    </div>
  );
}

function Corner({ className }: { className: string }) {
  return <div className={`absolute w-7 h-7 border-gold-400 ${className}`} />;
}
