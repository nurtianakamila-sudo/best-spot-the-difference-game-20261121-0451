// Small synthesised sounds, made with WebAudio: no audio files, no network. The context
// is created lazily on the first user gesture, so the page stays silent until played.

let context = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function ensureContext() {
  if (context === null) {
    const AudioContext = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

/** One short note: a sine or triangle tone that fades out. */
function tone(freq, delay, duration, type = 'sine', gainValue = 0.12) {
  if (muted) return;
  const ctx = ensureContext();
  if (ctx === null) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const start = ctx.currentTime + delay;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(gainValue, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/** A bright two-note chime when a difference is found. */
export function playFind() {
  tone(660, 0, 0.16, 'sine', 0.14);
  tone(990, 0.09, 0.24, 'sine', 0.12);
}

/** A soft low thud for a wrong click. */
export function playMiss() {
  tone(160, 0, 0.18, 'triangle', 0.1);
}

/** A rising arpeggio when a level is cleared. */
export function playWin() {
  [523, 659, 784, 1047].forEach((freq, i) => tone(freq, i * 0.11, 0.3, 'sine', 0.13));
}

/** A quiet click for buttons. */
export function playClick() {
  tone(440, 0, 0.06, 'sine', 0.06);
}

/** A short tick when the clock drops under ten seconds. */
export function playTick() {
  tone(880, 0, 0.05, 'sine', 0.05);
}
