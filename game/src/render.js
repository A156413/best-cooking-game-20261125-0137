// render.js — every pixel of the kitchen. A warm 2D canvas scene: brick wall
// and window, the chalk order board, a wooden counter with eight ingredient
// bins, the stove, the serving pass with its bell, and the assembly plate
// where a dish comes together. All art is drawn with canvas shapes — no
// images, no fonts from the network.

import { CANVAS_W, CANVAS_H, INGREDIENTS, ingredientById, dishById, COOK_SECONDS } from './config.js';

// Layout boxes, in canvas pixels. The canvas is fixed at 1280x720 and scaled
// to the window by CSS, so these never move.
export const LAYOUT = {
  board: { x: 24, y: 84, w: 292, h: 296 },
  pass: { x: 964, y: 84, w: 292, h: 180 },
  stove: { x: 964, y: 284, w: 292, h: 176 },
  counter: { x: 24, y: 486, w: 1232, h: 150 },
  plate: { x: 470, y: 392, w: 340, h: 92 },
  bins: { x: 48, y: 512, w: 82, gap: 14 },
  startButton: { x: 490, y: 448, w: 300, h: 64 },
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = '700') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Trebuchet MS, Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

// --- Ingredient icons: small vector drawings, one per pantry shape. ---
export function drawIngredientIcon(ctx, ingredient, cx, cy, r) {
  const { shape, color, dark } = ingredient;
  ctx.save();
  ctx.translate(cx, cy);
  if (shape === 'tomato') {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, 2, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3c8a2e';
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      ctx.moveTo(0, -r * 0.55);
      ctx.lineTo(Math.cos(a) * r * 0.55, -r * 0.55 + Math.sin(a) * r * 0.55);
    }
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.3, r * 0.22, 0, Math.PI * 2); ctx.fill();
  } else if (shape === 'leaf') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.6, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = dark; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r * 0.7, r * 0.35); ctx.quadraticCurveTo(0, -r * 0.1, r * 0.7, -r * 0.4); ctx.stroke();
  } else if (shape === 'wedge') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.6); ctx.lineTo(r, r * 0.6); ctx.lineTo(r * 0.7, -r * 0.7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.arc(-r * 0.25, r * 0.15, r * 0.14, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.35, r * 0.3, r * 0.12, 0, Math.PI * 2); ctx.fill();
  } else if (shape === 'noodle') {
    ctx.strokeStyle = color; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, i * r * 0.45);
      ctx.bezierCurveTo(-r * 0.3, i * r * 0.45 - r * 0.5, r * 0.3, i * r * 0.45 + r * 0.5, r * 0.8, i * r * 0.45);
      ctx.stroke();
    }
  } else if (shape === 'mushroom') {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, -r * 0.15, r * 0.95, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f4ead8';
    ctx.fillRect(-r * 0.28, -r * 0.2, r * 0.56, r * 0.85);
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.arc(-r * 0.4, -r * 0.55, r * 0.14, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.3, -r * 0.7, r * 0.12, 0, Math.PI * 2); ctx.fill();
  } else if (shape === 'carrot') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.5); ctx.lineTo(r * 0.55, -r * 0.5); ctx.lineTo(0, r); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5fbf4a';
    ctx.beginPath(); ctx.ellipse(-r * 0.25, -r * 0.75, r * 0.3, r * 0.45, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(r * 0.3, -r * 0.75, r * 0.3, r * 0.45, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = dark; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r * 0.3, 0); ctx.lineTo(r * 0.3, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r * 0.2, r * 0.4); ctx.lineTo(r * 0.2, r * 0.4); ctx.stroke();
  } else if (shape === 'berry') {
    ctx.fillStyle = color;
    for (const [dx, dy] of [[-0.4, -0.2], [0.4, -0.2], [0, 0.45]]) {
      ctx.beginPath(); ctx.arc(dx * r, dy * r, r * 0.55, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(-r * 0.45, -r * 0.4, r * 0.16, 0, Math.PI * 2); ctx.fill();
  } else { // dough
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.2, r * 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.35, r * 0.25, r * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, r * 0.45, r * 0.09, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawWall(ctx, now) {
  ctx.fillStyle = '#f3dfb6';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Brick courses along the top of the wall.
  ctx.fillStyle = '#e8c795';
  for (let row = 0; row < 3; row += 1) {
    for (let x = (row % 2) * -40; x < CANVAS_W; x += 96) {
      ctx.fillRect(x + 3, 66 + row * 22, 90, 16);
    }
  }
  // Window with a slow drifting sun and hills.
  ctx.fillStyle = '#8a5a33';
  roundRect(ctx, 340, 92, 300, 190, 10); ctx.fill();
  ctx.fillStyle = '#aee3f5';
  ctx.fillRect(352, 104, 276, 166);
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath(); ctx.arc(580, 140 + Math.sin(now / 2400) * 4, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7cc47f';
  ctx.beginPath(); ctx.ellipse(430, 272, 130, 34, 0, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.ellipse(560, 274, 140, 30, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(476, 104, 10, 166); ctx.fillRect(352, 180, 276, 10);
  // Hanging shelf with jars and a copper pan.
  ctx.fillStyle = '#7a4a28';
  ctx.fillRect(700, 150, 220, 12);
  const jarColors = ['#e8a33d', '#c96f4a', '#7ba05b'];
  jarColors.forEach((c, i) => {
    ctx.fillStyle = c;
    roundRect(ctx, 716 + i * 62, 108, 42, 42, 8); ctx.fill();
    ctx.fillStyle = '#5d3a1e'; ctx.fillRect(724 + i * 62, 100, 26, 10);
  });
  // Floor tiles.
  ctx.fillStyle = '#d9b98a';
  ctx.fillRect(0, 640, CANVAS_W, 80);
  ctx.strokeStyle = '#c2a06e'; ctx.lineWidth = 2;
  for (let x = 0; x <= CANVAS_W; x += 80) {
    ctx.beginPath(); ctx.moveTo(x, 640); ctx.lineTo(x - 20, 720); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(0, 680); ctx.lineTo(CANVAS_W, 680); ctx.stroke();
}

function drawHud(ctx, state) {
  ctx.fillStyle = '#2e1f14';
  ctx.fillRect(0, 0, CANVAS_W, 64);
  ctx.fillStyle = '#f5b81e';
  ctx.fillRect(0, 60, CANVAS_W, 4);
  text(ctx, 'GOLDEN LADLE', 24, 42, 26, '#f5b81e', 'left', '900');
  text(ctx, 'Hearth Kitchen Rush', 278, 42, 15, '#e8dcc8');
  // Shift timer, big in the middle, turning red under 30 seconds.
  const mins = Math.floor(state.timeLeft / 60);
  const secs = Math.floor(state.timeLeft % 60);
  const timerColor = state.timeLeft <= 30 ? '#ff6b5e' : '#ffffff';
  text(ctx, `${mins}:${String(secs).padStart(2, '0')}`, CANVAS_W / 2, 44, 34, timerColor, 'center', '900');
  text(ctx, 'SHIFT', CANVAS_W / 2, 20, 11, '#cbb896', 'center');
  text(ctx, `SCORE ${state.score}`, 1010, 30, 18, '#ffffff', 'right');
  text(ctx, `COINS ${state.coins}`, 1010, 52, 15, '#f5b81e', 'right');
  text(ctx, `SERVED ${state.served}`, 1140, 30, 18, '#ffffff', 'right');
  text(ctx, `MISSED ${state.missed}`, 1140, 52, 15, '#ff9d8a', 'right');
  if (state.combo >= 2) {
    ctx.fillStyle = '#ff8c1a';
    roundRect(ctx, 752, 8, 150, 30, 15); ctx.fill();
    text(ctx, `COMBO x${state.combo}`, 827, 29, 16, '#fff', 'center', '900');
  }
}

function drawOrderBoard(ctx, state, now) {
  const b = LAYOUT.board;
  ctx.fillStyle = '#3a2c1e';
  roundRect(ctx, b.x, b.y, b.w, b.h, 12); ctx.fill();
  ctx.fillStyle = '#2c2115';
  roundRect(ctx, b.x + 8, b.y + 8, b.w - 16, b.h - 16, 8); ctx.fill();
  text(ctx, 'ORDER BOARD', b.x + b.w / 2, b.y + 34, 18, '#f5d76e', 'center', '900');
  ctx.strokeStyle = '#f5d76e'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(b.x + 24, b.y + 46); ctx.lineTo(b.x + b.w - 24, b.y + 46); ctx.stroke();
  if (state.orders.length === 0) {
    text(ctx, 'No orders yet —', b.x + b.w / 2, b.y + 120, 16, '#e8dcc8', 'center');
    text(ctx, 'the lunch rush is coming!', b.x + b.w / 2, b.y + 146, 16, '#e8dcc8', 'center');
    return;
  }
  state.orders.forEach((order, i) => {
    const dish = dishById(order.dishId);
    const y = b.y + 62 + i * 74;
    const urgent = order.patience < 15;
    const bob = urgent ? Math.sin(now / 120) * 2 : 0;
    ctx.fillStyle = i === 0 ? '#fff6dd' : '#f3e3bd';
    roundRect(ctx, b.x + 14, y + bob, b.w - 28, 62, 8); ctx.fill();
    if (i === 0) {
      ctx.fillStyle = '#e5484d';
      roundRect(ctx, b.x + 14, y + bob, 8, 62, 4); ctx.fill();
      // Red NOW tag in the ticket's top-right corner.
      ctx.fillStyle = '#e5484d';
      roundRect(ctx, b.x + b.w - 66, y + 6 + bob, 44, 16, 8); ctx.fill();
      text(ctx, 'NOW', b.x + b.w - 44, y + 18 + bob, 10, '#fff', 'center', '900');
    }
    text(ctx, `#${order.id}  ${dish.name}`, b.x + (i === 0 ? 34 : 26), y + 22 + bob, 15, '#2e1f14', 'left', '800');
    dish.needs.forEach((needId, j) => {
      const ing = ingredientById(needId);
      const done = state.plateDish === dish.id || state.readyDish === dish.id
        || (i === 0 && state.plate.includes(needId));
      ctx.globalAlpha = done ? 0.35 : 1;
      drawIngredientIcon(ctx, ing, b.x + 44 + j * 34, y + 42 + bob, 11);
      ctx.globalAlpha = 1;
    });
    // Patience bar drains as the customer waits.
    const frac = Math.max(0, order.patience / order.patienceMax);
    ctx.fillStyle = '#d8c49a';
    roundRect(ctx, b.x + 150, y + 34 + bob, 108, 12, 6); ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#5fbf4a' : frac > 0.25 ? '#f5b81e' : '#e5484d';
    roundRect(ctx, b.x + 150, y + 34 + bob, 108 * frac, 12, 6); ctx.fill();
    text(ctx, `$${dish.price}`, b.x + b.w - 26, y + 46 + bob, 14, '#2e7d32', 'right', '900');
  });
}

function drawPass(ctx, state, now) {
  const p = LAYOUT.pass;
  ctx.fillStyle = '#8a5a33';
  roundRect(ctx, p.x, p.y, p.w, p.h, 12); ctx.fill();
  ctx.fillStyle = '#fff3d6';
  roundRect(ctx, p.x + 10, p.y + 10, p.w - 20, p.h - 20, 8); ctx.fill();
  text(ctx, 'THE PASS — RING TO SERVE', p.x + p.w / 2, p.y + 34, 13, '#7a4a28', 'center', '900');
  if (state.readyDish) {
    const dish = dishById(state.readyDish);
    const glow = 0.5 + Math.sin(now / 200) * 0.2;
    ctx.save();
    ctx.globalAlpha = glow;
    ctx.fillStyle = '#ffd76a';
    ctx.beginPath(); ctx.arc(p.x + 82, p.y + 108, 62, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(p.x + 82, p.y + 112, 56, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#cbb896'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(p.x + 82, p.y + 112, 56, 20, 0, 0, Math.PI * 2); ctx.stroke();
    dish.needs.forEach((needId, j) => {
      drawIngredientIcon(ctx, ingredientById(needId), p.x + 48 + j * 34, p.y + 104, 13);
    });
    text(ctx, dish.name, p.x + 82, p.y + 152, 13, '#2e1f14', 'center', '800');
    // The brass service bell, pulsing while a plate waits.
    ctx.fillStyle = '#c9962e';
    ctx.beginPath(); ctx.arc(p.x + 226, p.y + 108, 26, Math.PI, 0); ctx.fill();
    ctx.fillRect(p.x + 196, p.y + 106, 60, 6);
    ctx.fillStyle = '#8a6d1f';
    ctx.beginPath(); ctx.arc(p.x + 226, p.y + 80, 5, 0, Math.PI * 2); ctx.fill();
    text(ctx, 'SPACE', p.x + 226, p.y + 152, 12, '#7a4a28', 'center', '900');
  } else {
    ctx.strokeStyle = '#cbb896'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.ellipse(p.x + 82, p.y + 108, 56, 20, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, 'plate goes here', p.x + 82, p.y + 112, 13, '#a98f68', 'center');
    ctx.fillStyle = '#c9962e';
    ctx.beginPath(); ctx.arc(p.x + 226, p.y + 108, 26, Math.PI, 0); ctx.fill();
    ctx.fillRect(p.x + 196, p.y + 106, 60, 6);
    text(ctx, 'waiting…', p.x + 226, p.y + 152, 12, '#a98f68', 'center');
  }
}

function drawStove(ctx, state, now) {
  const s = LAYOUT.stove;
  ctx.fillStyle = '#4a4a52';
  roundRect(ctx, s.x, s.y, s.w, s.h, 12); ctx.fill();
  ctx.fillStyle = '#33333a';
  roundRect(ctx, s.x + 12, s.y + 12, s.w - 24, s.h - 24, 8); ctx.fill();
  text(ctx, 'STOVE', s.x + s.w / 2, s.y + 36, 14, '#e8e2d4', 'center', '900');
  // Two burners; the left one cooks.
  for (const bx of [s.x + 84, s.x + 208]) {
    ctx.fillStyle = '#1d1d22';
    ctx.beginPath(); ctx.arc(bx, s.y + 100, 46, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#66666e'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(bx, s.y + 100, 38, 0, Math.PI * 2); ctx.stroke();
  }
  if (state.cooking > 0 && state.cookingDish) {
    const dish = dishById(state.cookingDish);
    // Flames lick the pot while it cooks.
    for (let i = 0; i < 5; i += 1) {
      const fx = s.x + 84 - 36 + i * 18 + Math.sin(now / 90 + i) * 3;
      ctx.fillStyle = i % 2 ? '#ff8c1a' : '#ffd76a';
      ctx.beginPath();
      ctx.moveTo(fx - 8, s.y + 148);
      ctx.quadraticCurveTo(fx, s.y + 112 - Math.sin(now / 110 + i * 2) * 8, fx + 8, s.y + 148);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#2b2b31';
    ctx.beginPath(); ctx.ellipse(s.x + 84, s.y + 96, 46, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8a33d';
    ctx.beginPath(); ctx.arc(s.x + 84, s.y + 92, 34, 0, Math.PI * 2); ctx.fill();
    dish.needs.forEach((needId, j) => {
      drawIngredientIcon(ctx, ingredientById(needId), s.x + 56 + j * 28, s.y + 92, 10);
    });
    // Cook progress ring around the pot.
    const frac = 1 - state.cooking / COOK_SECONDS;
    ctx.strokeStyle = '#ffd76a'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(s.x + 84, s.y + 92, 56, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
    text(ctx, `${Math.ceil(state.cooking)}s`, s.x + 84, s.y + 138, 13, '#fff', 'center', '900');
  } else {
    ctx.fillStyle = '#5b5b63';
    ctx.beginPath(); ctx.ellipse(s.x + 84, s.y + 96, 46, 16, 0, 0, Math.PI * 2); ctx.fill();
    text(ctx, 'pot idle', s.x + 84, s.y + 100, 12, '#a9a9b2', 'center');
  }
  text(ctx, 'full plate cooks itself on the stove', s.x + s.w / 2, s.y + s.h + 18, 12, '#7a4a28', 'center');
}

function drawCounter(ctx, state, now) {
  const c = LAYOUT.counter;
  ctx.fillStyle = '#8a5a33';
  roundRect(ctx, c.x, c.y, c.w, c.h, 10); ctx.fill();
  ctx.fillStyle = '#a06a3c';
  roundRect(ctx, c.x, c.y, c.w, 18, 10); ctx.fill();
  ctx.strokeStyle = '#7a4a28'; ctx.lineWidth = 2;
  for (let x = c.x + 120; x < c.x + c.w; x += 120) {
    ctx.beginPath(); ctx.moveTo(x, c.y + 20); ctx.lineTo(x, c.y + c.h - 8); ctx.stroke();
  }
  // The eight ingredient bins, each with its key shortcut.
  INGREDIENTS.forEach((ing, i) => {
    const bx = LAYOUT.bins.x + i * (LAYOUT.bins.w + LAYOUT.bins.gap);
    const by = LAYOUT.bins.y;
    const target = state.orders.length > 0 ? dishById(state.orders[0].dishId) : null;
    const wanted = target && target.needs.includes(ing.id) && !state.plate.includes(ing.id);
    const pulse = wanted ? 1 + Math.sin(now / 180) * 0.06 : 1;
    ctx.save();
    ctx.translate(bx + LAYOUT.bins.w / 2, by + 34);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = wanted ? '#fff6dd' : '#f3e3bd';
    roundRect(ctx, -LAYOUT.bins.w / 2, -30, LAYOUT.bins.w, 76, 10); ctx.fill();
    if (wanted) {
      ctx.strokeStyle = '#f5b81e'; ctx.lineWidth = 3;
      roundRect(ctx, -LAYOUT.bins.w / 2, -30, LAYOUT.bins.w, 76, 10); ctx.stroke();
    }
    drawIngredientIcon(ctx, ing, 0, 2, 20);
    ctx.restore();
    text(ctx, ing.name, bx + LAYOUT.bins.w / 2, by + 66, 12, '#5d3a1e', 'center', '800');
    ctx.fillStyle = '#2e1f14';
    roundRect(ctx, bx + LAYOUT.bins.w - 18, by - 8, 20, 20, 6); ctx.fill();
    text(ctx, ing.key, bx + LAYOUT.bins.w - 8, by + 7, 12, '#f5b81e', 'center', '900');
  });
  text(ctx, 'CLICK AN INGREDIENT  •  KEYS 1–8  •  X TRASHES THE PLATE', CANVAS_W / 2, c.y + 138, 13, '#e8dcc8', 'center');
}

function drawPlate(ctx, state, now) {
  const p = LAYOUT.plate;
  // The assembly plate sits on a marble slab in the middle of the counter.
  ctx.fillStyle = '#e8e2d4';
  roundRect(ctx, p.x - 14, p.y - 14, p.w + 28, p.h + 28, 14); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2 + 6, p.w / 2 - 8, p.h / 2 - 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#cbb896'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2 + 6, p.w / 2 - 8, p.h / 2 - 4, 0, 0, Math.PI * 2); ctx.stroke();
  text(ctx, 'ASSEMBLY PLATE', p.x + p.w / 2, p.y - 20, 12, '#7a4a28', 'center', '900');
  const target = state.orders.length > 0 ? dishById(state.orders[0].dishId) : null;
  if (state.plate.length === 0) {
    text(ctx, state.readyDish ? 'dish ready on the pass — ring the bell!' : (target ? `building: ${target.name}` : 'waiting for an order…'), p.x + p.w / 2, p.y + p.h / 2 + 10, 15, '#a98f68', 'center');
  } else {
    // Three fixed slots: placed ingredients fill from the left, ghost rings
    // mark the slots the dish still needs — the mid-assembly read.
    state.plate.forEach((ingId, j) => {
      const x = p.x + 52 + j * 66;
      drawIngredientIcon(ctx, ingredientById(ingId), x, p.y + p.h / 2 + 4, 24);
    });
    if (target && state.plateDish === null) {
      target.needs.filter((id) => !state.plate.includes(id)).forEach((id, j) => {
        const x = p.x + 52 + (state.plate.length + j) * 66;
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#a98f68'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, p.y + p.h / 2 + 4, 24, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        drawIngredientIcon(ctx, ingredientById(id), x, p.y + p.h / 2 + 4, 24);
        ctx.save(); ctx.globalAlpha = 0.45;
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, p.y + p.h / 2 + 4, 24, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
    }
  }
  if (state.plateDish) {
    text(ctx, 'COMPLETE — to the stove!', p.x + p.w / 2, p.y + p.h + 24, 13, '#2e7d32', 'center', '900');
  }
}

function drawToast(ctx, state) {
  if (!state.message || state.messageTimer <= 0) return;
  const alpha = Math.min(1, state.messageTimer);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(46,31,20,0.92)';
  const w = Math.min(720, 40 + state.message.length * 8.4);
  roundRect(ctx, CANVAS_W / 2 - w / 2, 668, w, 40, 20); ctx.fill();
  text(ctx, state.message, CANVAS_W / 2, 694, 17, '#fff6dd', 'center');
  ctx.restore();
}

function drawTitle(ctx, state, now) {
  ctx.fillStyle = 'rgba(46,31,20,0.72)';
  ctx.fillRect(0, 64, CANVAS_W, CANVAS_H - 64);
  ctx.fillStyle = '#fff6dd';
  roundRect(ctx, 290, 130, 700, 400, 18); ctx.fill();
  ctx.strokeStyle = '#f5b81e'; ctx.lineWidth = 4;
  roundRect(ctx, 290, 130, 700, 400, 18); ctx.stroke();
  text(ctx, 'GOLDEN LADLE', 640, 210, 54, '#c2571b', 'center', '900');
  text(ctx, 'Hearth Kitchen Rush', 640, 252, 24, '#7a4a28', 'center');
  text(ctx, 'The lunch rush is on. Read the order board,', 640, 310, 18, '#2e1f14', 'center');
  text(ctx, 'click ingredients onto the plate, cook, and', 640, 338, 18, '#2e1f14', 'center');
  text(ctx, 'ring the bell before patience runs out.', 640, 366, 18, '#2e1f14', 'center');
  text(ctx, 'Mouse or keys 1–8 add ingredients  •  SPACE serves  •  X trashes the plate', 640, 412, 15, '#7a4a28', 'center');
  text(ctx, 'P pauses  •  R restarts  •  150-second shift', 640, 438, 15, '#7a4a28', 'center');
  const pulse = 1 + Math.sin(now / 300) * 0.04;
  ctx.save();
  ctx.translate(640, 480); ctx.scale(pulse, pulse);
  ctx.fillStyle = '#e5484d';
  roundRect(ctx, -150, -32, 300, 64, 32); ctx.fill();
  text(ctx, 'START SHIFT  ▶', 0, 8, 24, '#fff', 'center', '900');
  ctx.restore();
  text(ctx, 'click the button or press ENTER', 640, 524, 13, '#a98f68', 'center');
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(46,31,20,0.66)';
  ctx.fillRect(0, 64, CANVAS_W, CANVAS_H - 64);
  text(ctx, 'PAUSED', 640, 340, 56, '#fff6dd', 'center', '900');
  text(ctx, 'press P to keep cooking', 640, 386, 18, '#e8dcc8', 'center');
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = 'rgba(46,31,20,0.78)';
  ctx.fillRect(0, 64, CANVAS_W, CANVAS_H - 64);
  ctx.fillStyle = '#fff6dd';
  roundRect(ctx, 330, 120, 620, 420, 18); ctx.fill();
  ctx.strokeStyle = '#f5b81e'; ctx.lineWidth = 4;
  roundRect(ctx, 330, 120, 620, 420, 18); ctx.stroke();
  text(ctx, 'SHIFT OVER!', 640, 190, 44, '#c2571b', 'center', '900');
  const stars = state.stars;
  for (let i = 0; i < 3; i += 1) {
    const x = 560 + i * 80;
    ctx.fillStyle = i < stars ? '#f5b81e' : '#d8c49a';
    drawStar(ctx, x, 250, i < stars ? 30 : 24);
  }
  text(ctx, `Score  ${state.score}`, 640, 320, 26, '#2e1f14', 'center', '900');
  text(ctx, `Dishes served ${state.served}   •   Customers lost ${state.missed}`, 640, 360, 18, '#2e1f14', 'center');
  text(ctx, `Coins earned ${state.coins}   •   Best combo x${state.bestCombo}`, 640, 392, 18, '#2e1f14', 'center');
  text(ctx, state.served >= 6 ? 'Head chef material — the regulars will be back!' : 'A solid first shift. The board moves faster next time.', 640, 436, 16, '#7a4a28', 'center');
  ctx.fillStyle = '#e5484d';
  roundRect(ctx, 490, 470, 300, 56, 28); ctx.fill();
  text(ctx, 'COOK AGAIN  ↻', 640, 506, 22, '#fff', 'center', '900');
  text(ctx, 'press R or click the button', 640, 560, 13, '#a98f68', 'center');
}

function drawStar(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(ang) * rad;
    const y = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill();
}

export function render(ctx, state, now) {
  drawWall(ctx, now);
  drawHud(ctx, state);
  drawOrderBoard(ctx, state, now);
  drawPass(ctx, state, now);
  drawStove(ctx, state, now);
  drawCounter(ctx, state, now);
  drawPlate(ctx, state, now);
  drawToast(ctx, state);
  if (state.flash && state.elapsed < state.flash.until) {
    ctx.fillStyle = state.flash.kind === 'good' ? 'rgba(95,191,74,0.18)' : 'rgba(229,72,77,0.18)';
    ctx.fillRect(0, 64, CANVAS_W, CANVAS_H - 64);
  }
  if (state.phase === 'title') drawTitle(ctx, state, now);
  else if (state.phase === 'paused') drawPaused(ctx);
  else if (state.phase === 'over') drawGameOver(ctx, state);
}
