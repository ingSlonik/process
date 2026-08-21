// Procedural Web Audio API sound generator for JS13k
let audioCtx: AudioContext | null = null;
let muted = false;

export function initAudio(): void {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function isMuted(): boolean {
  return muted;
}

export function toggleMute(): boolean {
  muted = !muted;
  return muted;
}

// Gentle crystal chime when rotating or moving a prism
let lastRotateSound = 0;
export function playPrismRotate(rotSpeed: number = 1): void {
  if (muted || !audioCtx) return;
  const now = performance.now();
  if (now - lastRotateSound < 60) return;
  lastRotateSound = now;

  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const t = audioCtx.currentTime;

    osc.type = 'sine';
    const baseFreq = 520 + (Math.abs(rotSpeed) * 300) % 400;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.08);

    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  } catch {}
}

// Soft energy pulse when sensor charges
let lastChargeSound = 0;
export function playSensorPulse(progress: number): void {
  if (muted || !audioCtx) return;
  const now = performance.now();
  if (now - lastChargeSound < 120) return;
  lastChargeSound = now;

  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const t = audioCtx.currentTime;

    osc.type = 'triangle';
    const freq = 400 + progress * 400;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.2, t + 0.1);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.11);
  } catch {}
}

// Sparkling victory arpeggio on level completion
export function playVictory(): void {
  if (muted || !audioCtx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
    const t0 = audioCtx.currentTime;

    notes.forEach((freq, index) => {
      const t = t0 + index * 0.08;
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(audioCtx!.destination);

      osc.start(t);
      osc.stop(t + 0.45);
    });
  } catch {}
}

// Click sound for UI buttons
export function playClick(): void {
  if (muted || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const t = audioCtx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    gain.gain.setValueAtTime(0.03, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  } catch {}
}
