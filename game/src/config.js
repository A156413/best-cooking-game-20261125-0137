// Golden Ladle — Hearth Kitchen Rush
// config.js — every tunable fact about the kitchen lives here: the pantry,
// the menu, the shift clock and the scoring. Nothing in here draws or listens.

export const CANVAS_W = 1280;
export const CANVAS_H = 720;

// One shift lasts this long. Orders keep arriving until the clock runs out.
export const SHIFT_SECONDS = 150;
export const MAX_ACTIVE_ORDERS = 3;
export const ORDER_PATIENCE_SECONDS = 55;
export const ORDER_SPAWN_EVERY_SECONDS = 14;
export const COOK_SECONDS = 3.0;
export const COMBO_WINDOW_SECONDS = 12;

// The pantry: eight ingredient bins on the counter. `key` is the keyboard
// shortcut, `color` the bin paint, `shape` picks the drawn icon.
export const INGREDIENTS = [
  { id: 'tomato',   name: 'Tomato',   key: '1', color: '#e5484d', dark: '#a92c31', shape: 'tomato' },
  { id: 'lettuce',  name: 'Lettuce',  key: '2', color: '#5fbf4a', dark: '#3c8a2e', shape: 'leaf' },
  { id: 'cheese',   name: 'Cheese',   key: '3', color: '#f5b81e', dark: '#c78d08', shape: 'wedge' },
  { id: 'pasta',    name: 'Pasta',    key: '4', color: '#f2d492', dark: '#c9a45c', shape: 'noodle' },
  { id: 'mushroom', name: 'Mushroom', key: '5', color: '#e8dcc8', dark: '#a98f68', shape: 'mushroom' },
  { id: 'carrot',   name: 'Carrot',   key: '6', color: '#f07f13', dark: '#b85c05', shape: 'carrot' },
  { id: 'berry',    name: 'Berry',    key: '7', color: '#7b4fd0', dark: '#57359c', shape: 'berry' },
  { id: 'dough',    name: 'Dough',    key: '8', color: '#e9c9a0', dark: '#b98f5e', shape: 'dough' },
];

// The menu: every dish is a set of three pantry ingredients. The board shows
// the dish name and its three icons; the player assembles them on the plate.
export const DISHES = [
  { id: 'pasta',   name: 'Sunny Tomato Pasta', needs: ['pasta', 'tomato', 'cheese'],    price: 14, cook: true },
  { id: 'salad',   name: 'Garden Crunch Salad', needs: ['lettuce', 'tomato', 'carrot'], price: 11, cook: false },
  { id: 'soup',    name: 'Woodland Mushroom Soup', needs: ['mushroom', 'tomato', 'lettuce'], price: 13, cook: true },
  { id: 'tart',    name: 'Berry Cloud Tart', needs: ['berry', 'dough', 'cheese'],        price: 16, cook: true },
  { id: 'stirfry', name: 'Ember Carrot Stir-fry', needs: ['carrot', 'mushroom', 'pasta'], price: 15, cook: true },
  { id: 'bruschetta', name: 'Golden Bruschetta', needs: ['dough', 'tomato', 'cheese'],   price: 12, cook: false },
];

// Scoring: base price, a patience bonus for serving fast, and a combo
// multiplier that grows when orders are served back to back.
export const SCORE = {
  patienceBonusMax: 8,
  wrongIngredientPenalty: 2,
  expiredOrderPenalty: 5,
  comboStep: 0.25,
  comboMax: 2.0,
};

export function ingredientById(id) {
  return INGREDIENTS.find((ing) => ing.id === id);
}

export function dishById(id) {
  return DISHES.find((dish) => dish.id === id);
}
