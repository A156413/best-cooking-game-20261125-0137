// state.js — the whole game state in one plain object, plus the pure rules
// that move it: spawning orders, assembling a dish, cooking, serving, and
// scoring. No drawing and no input here, so the rules are easy to test.

import {
  DISHES, INGREDIENTS, SHIFT_SECONDS, MAX_ACTIVE_ORDERS,
  ORDER_PATIENCE_SECONDS, ORDER_SPAWN_EVERY_SECONDS, COOK_SECONDS,
  COMBO_WINDOW_SECONDS, SCORE, dishById,
} from './config.js';

export function newShift() {
  return {
    phase: 'title', // title | playing | paused | over
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    orders: [],
    nextOrderIn: 2,
    orderSerial: 0,
    plate: [], // ingredient ids on the assembly plate, in added order
    plateDish: null, // dish id the plate matches, once all three are on
    cooking: 0, // seconds left on the stove, 0 when idle
    cookingDish: null,
    readyDish: null, // dish id on the pass, waiting to be served
    score: 0,
    coins: 0,
    served: 0,
    missed: 0,
    combo: 0,
    comboTimer: 0,
    bestCombo: 0,
    message: '',
    messageTimer: 0,
    stars: 0,
    flash: null, // { kind: 'good' | 'bad', until }
    stats: { perfect: 0, late: 0 },
  };
}

function randomDish(excludeIds) {
  const pool = DISHES.filter((dish) => !excludeIds.includes(dish.id));
  return pool[Math.floor(Math.random() * pool.length)];
}

export function spawnOrder(state) {
  if (state.orders.length >= MAX_ACTIVE_ORDERS) return;
  const dish = randomDish(state.orders.map((order) => order.dishId));
  state.orderSerial += 1;
  state.orders.push({
    id: state.orderSerial,
    dishId: dish.id,
    patience: ORDER_PATIENCE_SECONDS,
    patienceMax: ORDER_PATIENCE_SECONDS,
  });
}

export function currentTargetDish(state) {
  // The plate is assembled against the oldest open order: the board's first
  // ticket is the one the kitchen is working on.
  return state.orders.length > 0 ? dishById(state.orders[0].dishId) : null;
}

export function addIngredient(state, ingredientId) {
  if (state.phase !== 'playing' || state.cooking > 0 || state.readyDish) return 'busy';
  const target = currentTargetDish(state);
  if (!target) return 'no-order';
  if (state.plate.includes(ingredientId)) return 'duplicate';
  if (!target.needs.includes(ingredientId)) {
    state.score = Math.max(0, state.score - SCORE.wrongIngredientPenalty);
    state.combo = 0;
    setMessage(state, `Wrong for ${target.name} — ${SCORE.wrongIngredientPenalty} pts`, 1.6);
    state.flash = { kind: 'bad', until: state.elapsed + 0.5 };
    return 'wrong';
  }
  state.plate.push(ingredientId);
  if (state.plate.length === target.needs.length) {
    state.plateDish = target.id;
    if (target.cook) {
      startCooking(state, target);
      return 'cooking';
    }
    state.readyDish = target.id;
    setMessage(state, `${target.name} ready — ring the bell!`, 2.0);
    return 'ready';
  }
  return 'added';
}

export function startCooking(state, dish) {
  state.cooking = COOK_SECONDS;
  state.cookingDish = dish.id;
  setMessage(state, `${dish.name} on the stove…`, 1.6);
}

export function trashPlate(state) {
  if (state.plate.length === 0) return;
  state.plate = [];
  state.plateDish = null;
  setMessage(state, 'Plate cleared', 1.2);
}

export function serveReadyDish(state) {
  if (state.phase !== 'playing' || !state.readyDish) return false;
  const dish = dishById(state.readyDish);
  const orderIndex = state.orders.findIndex((order) => order.dishId === dish.id);
  if (orderIndex === -1) return false;
  const order = state.orders[orderIndex];
  const patienceFrac = order.patience / order.patienceMax;
  const patienceBonus = Math.round(SCORE.patienceBonusMax * patienceFrac);
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.comboTimer = COMBO_WINDOW_SECONDS;
  const multiplier = 1 + Math.min(SCORE.comboMax - 1, (state.combo - 1) * SCORE.comboStep);
  const earned = Math.round((dish.price + patienceBonus) * multiplier);
  state.score += earned;
  state.coins += earned;
  state.served += 1;
  if (patienceFrac > 0.6) state.stats.perfect += 1;
  else state.stats.late += 1;
  state.orders.splice(orderIndex, 1);
  state.readyDish = null;
  state.plate = [];
  state.plateDish = null;
  state.flash = { kind: 'good', until: state.elapsed + 0.6 };
  setMessage(state, `Served ${dish.name}  +${earned} coins  (combo x${state.combo})`, 2.2);
  return true;
}

export function setMessage(state, text, seconds) {
  state.message = text;
  state.messageTimer = seconds;
}

export function tick(state, dt) {
  if (state.phase !== 'playing') return;
  state.elapsed += dt;
  state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);
  if (state.messageTimer > 0) state.messageTimer -= dt;
  if (state.comboTimer > 0) {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) state.combo = 0;
  }
  if (state.cooking > 0) {
    state.cooking -= dt;
    if (state.cooking <= 0) {
      state.cooking = 0;
      state.readyDish = state.cookingDish;
      state.cookingDish = null;
      const dish = dishById(state.readyDish);
      setMessage(state, `${dish.name} is cooked — ring the bell!`, 2.0);
    }
  }
  // Orders keep arriving on a steady rhythm until the clock runs out.
  state.nextOrderIn -= dt;
  if (state.nextOrderIn <= 0) {
    spawnOrder(state);
    state.nextOrderIn = ORDER_SPAWN_EVERY_SECONDS;
  }
  // Patience drains; a starved order walks out and costs the kitchen.
  for (let i = state.orders.length - 1; i >= 0; i -= 1) {
    const order = state.orders[i];
    order.patience -= dt;
    if (order.patience <= 0) {
      state.orders.splice(i, 1);
      state.missed += 1;
      state.score = Math.max(0, state.score - SCORE.expiredOrderPenalty);
      state.combo = 0;
      if (state.plateDish === order.dishId || state.readyDish === order.dishId) {
        state.plate = [];
        state.plateDish = null;
        state.readyDish = null;
      }
      setMessage(state, `A customer left!  -${SCORE.expiredOrderPenalty} pts`, 2.0);
      state.flash = { kind: 'bad', until: state.elapsed + 0.5 };
    }
  }
  if (state.timeLeft <= 0) {
    state.phase = 'over';
    setMessage(state, '', 0);
  }
}

export function starsFor(state) {
  if (state.served >= 9 && state.missed === 0) return 3;
  if (state.served >= 6) return 3;
  if (state.served >= 4) return 2;
  if (state.served >= 2) return 1;
  return 0;
}

export { INGREDIENTS };
