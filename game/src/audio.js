// audio.js — every sound is synthesized with WebAudio oscillators, so the
// game ships no audio files and makes no network request. A tiny helper
// builds a blip; each named cue composes a few of them.

let audioContext = null;

export function ensureAudio() {
  if (!audioContext) {
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      audioContext = new Ctor();
    } catch {
      audioContext = null;
    }
  }
  if (audioContext && audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function blip(freq, startAt, duration, type = 'sine', gain = 0.12) {
  const ctx = audioContext;
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, ctx.currentTime + startAt);
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + duration);
}

export function playCue(name) {
  if (!ensureAudio()) return;
  if (name === 'add') {
    blip(520, 0, 0.09, 'triangle', 0.14);
    blip(780, 0.05, 0.1, 'triangle', 0.1);
  } else if (name === 'wrong') {
    blip(160, 0, 0.18, 'sawtooth', 0.08);
  } else if (name === 'cook') {
    blip(300, 0, 0.12, 'sine', 0.1);
    blip(420, 0.1, 0.12, 'sine', 0.1);
    blip(560, 0.2, 0.16, 'sine', 0.1);
  } else if (name === 'ding') {
    blip(880, 0, 0.22, 'sine', 0.16);
    blip(1318, 0.08, 0.3, 'sine', 0.12);
  } else if (name === 'serve') {
    blip(660, 0, 0.1, 'triangle', 0.14);
    blip(880, 0.08, 0.1, 'triangle', 0.14);
    blip(1100, 0.16, 0.2, 'triangle', 0.12);
  } else if (name === 'start') {
    blip(392, 0, 0.12, 'triangle', 0.12);
    blip(523, 0.1, 0.12, 'triangle', 0.12);
    blip(659, 0.2, 0.2, 'triangle', 0.12);
  } else if (name === 'lose') {
    blip(330, 0, 0.2, 'sine', 0.1);
    blip(247, 0.18, 0.3, 'sine', 0.1);
  }
}
