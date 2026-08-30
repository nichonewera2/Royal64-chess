'use client';

/**
 * HONESTY NOTE: these are synthesized tones generated at runtime with the
 * Web Audio API, not recorded wood/chess-set sound samples — this sandbox
 * has no network access to source real audio files. They're tuned to
 * sound like plausible move/capture/check cues (short percussive clicks
 * with a wood-ish low-pass filter) rather than a generic beep. Swapping in
 * real recorded samples later is a drop-in replacement: just point these
 * functions at <audio> playback instead of the oscillator calls below.
 */

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  lowpass?: number;
}

function playTone({ frequency, duration, type = 'sine', volume = 0.25, lowpass }: ToneOptions) {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);

  let node: AudioNode = osc;
  if (lowpass) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    node.connect(filter);
    node = filter;
  }

  node.connect(gain);
  gain.connect(ctx.destination);

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playMoveSound() {
  // Short, dry "wood on wood" tap.
  playTone({ frequency: 220, duration: 0.09, type: 'triangle', volume: 0.22, lowpass: 900 });
  setTimeout(
    () => playTone({ frequency: 140, duration: 0.07, type: 'triangle', volume: 0.14, lowpass: 700 }),
    30
  );
}

export function playCaptureSound() {
  playTone({ frequency: 180, duration: 0.14, type: 'sawtooth', volume: 0.22, lowpass: 1200 });
  setTimeout(
    () => playTone({ frequency: 90, duration: 0.12, type: 'square', volume: 0.14, lowpass: 500 }),
    20
  );
}

export function playCheckSound() {
  playTone({ frequency: 660, duration: 0.12, type: 'square', volume: 0.15 });
  setTimeout(() => playTone({ frequency: 880, duration: 0.14, type: 'square', volume: 0.15 }), 90);
}

export function playCastleSound() {
  playTone({ frequency: 200, duration: 0.08, type: 'triangle', volume: 0.2, lowpass: 900 });
  setTimeout(
    () => playTone({ frequency: 260, duration: 0.08, type: 'triangle', volume: 0.18, lowpass: 900 }),
    60
  );
}

export function playGameEndSound() {
  [523, 440, 349].forEach((freq, i) => {
    setTimeout(() => playTone({ frequency: freq, duration: 0.3, type: 'sine', volume: 0.16 }), i * 140);
  });
}

export function playChatSound() {
  playTone({ frequency: 500, duration: 0.06, type: 'sine', volume: 0.12 });
}
