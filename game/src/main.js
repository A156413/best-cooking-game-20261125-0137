// main.js — boots Golden Ladle: the canvas, the loop, and the wiring between
// input, state and rendering. With `?shot=` in the URL it renders one staged
// scene instead and holds the clock still, so screenshots are reproducible.

import { CANVAS_W, CANVAS_H } from './config.js';
import { newShift, tick, addIngredient, trashPlate, serveReadyDish, spawnOrder, starsFor } from './state.js';
import { render, LAYOUT } from './render.js';
import { bindInput, ingredientBinAt } from './input.js';
import { playCue, ensureAudio } from './audio.js';
import { stagedState, shotFromUrl } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

let state = newShift();
let shotMode = false;
let lastFrame = performance.now();

function announce(text) {
  if (statusEl) statusEl.textContent = text;
}

function startShift() {
  state = newShift();
  state.phase = 'playing';
  spawnOrder(state);
  spawnOrder(state);
  playCue('start');
  announce('Shift started. Two orders on the board.');
}

function onIngredient(ingredientId) {
  if (state.phase === 'title') return;
  if (state.phase !== 'playing') return;
  ensureAudio();
  const result = addIngredient(state, ingredientId);
  if (result === 'added') playCue('add');
  else if (result === 'ready') playCue('ding');
  else if (result === 'cooking') playCue('cook');
  else if (result === 'wrong' || result === 'duplicate') playCue('wrong');
}

function onClick(point) {
  ensureAudio();
  if (state.phase === 'title') {
    if (point.x >= LAYOUT.startButton.x && point.x <= LAYOUT.startButton.x + LAYOUT.startButton.w
      && point.y >= LAYOUT.startButton.y && point.y <= LAYOUT.startButton.y + LAYOUT.startButton.h) {
      startShift();
    }
    return;
  }
  if (state.phase === 'over') {
    if (point.x >= 490 && point.x <= 790 && point.y >= 470 && point.y <= 526) startShift();
    return;
  }
  if (state.phase !== 'playing') return;
  // The bell: clicking the pass serves a ready plate.
  if (state.readyDish
    && point.x >= LAYOUT.pass.x && point.x <= LAYOUT.pass.x + LAYOUT.pass.w
    && point.y >= LAYOUT.pass.y && point.y <= LAYOUT.pass.y + LAYOUT.pass.h) {
    onServe();
    return;
  }
  const bin = ingredientBinAt(point);
  if (bin) onIngredient(bin);
}

function onServe() {
  if (state.phase !== 'playing') return;
  if (serveReadyDish(state)) {
    playCue('serve');
    announce(`Served. Score ${state.score}.`);
  } else if (state.readyDish) {
    playCue('wrong');
  }
}

function onConfirm() {
  if (state.phase === 'title' || state.phase === 'over') startShift();
}

function onTrash() {
  if (state.phase !== 'playing') return;
  trashPlate(state);
}

function onPause() {
  if (state.phase === 'playing') {
    state.phase = 'paused';
    announce('Paused.');
  } else if (state.phase === 'paused') {
    state.phase = 'playing';
    announce('Back to cooking.');
  }
}

function onRestart() {
  if (state.phase !== 'title') startShift();
}

bindInput(canvas, {
  onClick, onIngredient, onServe, onConfirm, onTrash, onPause, onRestart,
});

function frame(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  if (!shotMode) {
    const wasOver = state.phase === 'over';
    tick(state, dt);
    if (state.phase === 'over' && !wasOver) {
      state.stars = starsFor(state);
      playCue(state.served >= 4 ? 'ding' : 'lose');
      announce(`Shift over. Served ${state.served}, score ${state.score}.`);
    }
  }
  render(ctx, state, now);
  requestAnimationFrame(frame);
}

function boot() {
  const shot = shotFromUrl(window.location.href);
  if (shot) {
    const staged = stagedState(shot);
    if (staged) {
      state = staged;
      shotMode = true;
    }
  }
  // Announce the shift clock for screen readers once a second.
  setInterval(() => {
    if (state.phase === 'playing' && !shotMode) {
      announce(`Time left ${Math.ceil(state.timeLeft)} seconds, score ${state.score}, ${state.orders.length} orders open.`);
    }
  }, 5000);
  requestAnimationFrame(frame);
}

boot();
