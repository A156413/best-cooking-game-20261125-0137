// input.js — mouse and keyboard, translated into game actions. Clicks are
// hit-tested against the canvas layout (the canvas is scaled by CSS, so
// client coordinates are mapped back into 1280x720 space). Keys 1-8 drop an
// ingredient on the plate, Space rings the bell, X trashes the plate.

import { INGREDIENTS } from './config.js';
import { LAYOUT } from './render.js';

function toCanvasPoint(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * canvas.width,
    y: ((clientY - rect.top) / rect.height) * canvas.height,
  };
}

function inside(point, box) {
  return point.x >= box.x && point.x <= box.x + box.w
    && point.y >= box.y && point.y <= box.y + box.h;
}

export function ingredientBinAt(point) {
  for (let i = 0; i < INGREDIENTS.length; i += 1) {
    const bx = LAYOUT.bins.x + i * (LAYOUT.bins.w + LAYOUT.bins.gap);
    if (inside(point, { x: bx, y: LAYOUT.bins.y - 8, w: LAYOUT.bins.w, h: 84 })) {
      return INGREDIENTS[i].id;
    }
  }
  return null;
}

export function bindInput(canvas, handlers) {
  canvas.addEventListener('click', (event) => {
    const point = toCanvasPoint(canvas, event.clientX, event.clientY);
    handlers.onClick(point);
  });
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key >= '1' && key <= '8') {
      handlers.onIngredient(INGREDIENTS[Number(key) - 1].id);
    } else if (key === ' ') {
      event.preventDefault();
      handlers.onServe();
    } else if (key === 'enter') {
      handlers.onConfirm();
    } else if (key === 'x' || key === 'backspace' || key === 'delete') {
      handlers.onTrash();
    } else if (key === 'p' || key === 'escape') {
      handlers.onPause();
    } else if (key === 'r') {
      handlers.onRestart();
    }
  });
}
