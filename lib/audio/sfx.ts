'use client';

/**
 * HONESTY NOTE: these are synthesized sounds generated at runtime with the
 * Web Audio API, not recorded wood/chess-set audio samples — this sandbox
 * has no network access to source real audio files. Each sound layers a
 * short filtered noise "knock" transient (for percussive punch, like a
 * wooden piece striking the board) under a tonal component, run through a
 * compressor so it reads as loud and solid rather than thin — this was
 * rebuilt significantly louder after feedback that the first version was
 * too quiet. Swapping in real recorded samples later is a drop-in
 * replacement: point these functions at <audio> playback instead of the
 * oscillator/noise calls below.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

/** Master volume multiplier, 0–1. Exposed via setSfxVolume() for a future settings toggle. */
let masterVolume = 1.0;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();

    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 12;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.002;
    compressor.release.value = 0.15;

    masterGain = audioCtx.createGain();
    masterGain.gain.value = masterVolume;

    masterGain.connect(compressor);
    compressor.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setSfxVolume(volume: number) {
  masterVolume = Math.max(0, Math.min(1, volume));
  if (masterGain) masterGain.gain.value = masterVolume;
}

function getMasterGain(ctx: AudioContext): GainNode {
  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.gain.value = masterVolume;
    masterGain.connect(ctx.destination);
  }
  return masterGain;
}

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    const length = ctx.sampleRate * 0.25;
    noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  return noiseBuffer;
}

interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  lowpass?: number;
  delay?: number;
}

function playTone({ frequency, duration, type = 'sine', volume = 0.5, lowpass, delay = 0 }: ToneOptions) {
  const ctx = getContext();
  if (!ctx) return;
  const startAt = ctx.currentTime + delay;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startAt);

  let node: AudioNode = osc;
  if (lowpass) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    node.connect(filter);
    node = filter;
  }

  node.connect(gain);
  gain.connect(getMasterGain(ctx));

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

/** A short burst of filtered noise for the percussive "knock" of a piece hitting wood. */
function playKnock({
  duration = 0.09,
  volume = 0.55,
  lowpass = 1800,
  delay = 0
}: {
  duration?: number;
  volume?: number;
  lowpass?: number;
  delay?: number;
} = {}) {
  const ctx = getContext();
  if (!ctx) return;
  const startAt = ctx.currentTime + delay;

  const source = ctx.createBufferSource();
  source.buffer = getNoiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = lowpass;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(getMasterGain(ctx));

  source.start(startAt);
  source.stop(startAt + duration + 0.02);
}

export function playMoveSound() {
  playKnock({ duration: 0.1, volume: 0.6, lowpass: 1600 });
  playTone({ frequency: 190, duration: 0.16, type: 'triangle', volume: 0.4, lowpass: 900 });
}

export function playCaptureSound() {
  playKnock({ duration: 0.14, volume: 0.75, lowpass: 2200 });
  playTone({ frequency: 150, duration: 0.22, type: 'sawtooth', volume: 0.45, lowpass: 1000 });
  playTone({ frequency: 80, duration: 0.18, type: 'square', volume: 0.3, lowpass: 500, delay: 0.03 });
}

export function playCastleSound() {
  playKnock({ duration: 0.08, volume: 0.55, lowpass: 1500 });
  playTone({ frequency: 200, duration: 0.13, type: 'triangle', volume: 0.42, lowpass: 900 });
  playKnock({ duration: 0.08, volume: 0.55, lowpass: 1500, delay: 0.09 });
  playTone({ frequency: 260, duration: 0.13, type: 'triangle', volume: 0.4, lowpass: 900, delay: 0.09 });
}

export function playCheckSound() {
  playTone({ frequency: 660, duration: 0.16, type: 'square', volume: 0.32 });
  playTone({ frequency: 880, duration: 0.2, type: 'square', volume: 0.34, delay: 0.11 });
}

export function playGameEndSound() {
  [523, 440, 349].forEach((freq, i) => {
    playTone({ frequency: freq, duration: 0.36, type: 'sine', volume: 0.34, delay: i * 0.15 });
  });
}

export function playChatSound() {
  playTone({ frequency: 520, duration: 0.08, type: 'sine', volume: 0.28 });
}
