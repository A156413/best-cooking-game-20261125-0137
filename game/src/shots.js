// shots.js — staged scenes for the entry's screenshots. A `?shot=` query
// builds one fixed, readable moment of the game (title, mid-assembly,
// plate ready to serve, shift over) from a plain state object, so the
// screenshots are real renders of this game's own code with the clock held
// still. Normal play never takes this path.

import { newShift } from './state.js';

function withOrders(state, dishIds, patienceFracs) {
  dishIds.forEach((dishId, i) => {
    state.orderSerial += 1;
    state.orders.push({
      id: state.orderSerial,
      dishId,
      patience: 55 * (patienceFracs[i] ?? 0.8),
      patienceMax: 55,
    });
  });
  return state;
}

export function stagedState(shot) {
  const state = newShift();
  if (shot === 'start') {
    // Title screen over a kitchen that already has orders waiting.
    withOrders(state, ['pasta', 'salad'], [0.9, 0.7]);
    state.phase = 'title';
    return state;
  }
  if (shot === 'play') {
    // Mid-shift: two orders on the board, the first dish half built on the
    // plate (pasta + tomato in, cheese ghosted), timer at 2:11.
    withOrders(state, ['pasta', 'soup', 'salad'], [0.72, 0.85, 0.45]);
    state.phase = 'playing';
    state.elapsed = 19;
    state.timeLeft = 131;
    state.score = 46;
    state.coins = 46;
    state.served = 3;
    state.combo = 2;
    state.comboTimer = 8;
    state.plate = ['pasta', 'tomato'];
    state.message = 'Tomato Pasta: one more — cheese!';
    state.messageTimer = 99;
    return state;
  }
  if (shot === 'serve') {
    // A cooked dish waits on the pass under the bell, another order behind
    // it; the plate is empty and the next dish is about to be built.
    withOrders(state, ['tart', 'stirfry'], [0.6, 0.9]);
    state.phase = 'playing';
    state.elapsed = 150 - 84;
    state.timeLeft = 84;
    state.score = 103;
    state.coins = 103;
    state.served = 7;
    state.combo = 3;
    state.comboTimer = 9;
    state.readyDish = 'tart';
    state.message = 'Berry Cloud Tart is cooked — ring the bell!';
    state.messageTimer = 99;
    state.flash = { kind: 'good', until: 9999 };
    return state;
  }
  if (shot === 'end') {
    // The shift is over: three stars, the tally, and the cook-again button.
    state.phase = 'over';
    state.timeLeft = 0;
    state.score = 148;
    state.coins = 148;
    state.served = 8;
    state.missed = 1;
    state.bestCombo = 4;
    state.stars = 3;
    return state;
  }
  return null;
}

export function shotFromUrl(url) {
  const params = new URL(url).searchParams;
  return params.get('shot');
}
