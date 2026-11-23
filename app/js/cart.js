export const PRODUCTS = [
  {
    id: 'notebook',
    name: 'A5 Dotted Notebook',
    pricePaise: 24990,
    description: '160 pages, 100 gsm acid-free dot grid paper with hard cover.',
    testId: 'line-total-notebook'
  },
  {
    id: 'pen',
    name: 'Brass Fountain Pen',
    pricePaise: 119995,
    description: 'Solid brass body, fine stainless steel nib, refillable converter.',
    testId: 'line-total-pen'
  }
];

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 20;

// Reverts invalid or out-of-range typed inputs to the last known valid quantity.
export function clampQuantity(input, fallback = MIN_QUANTITY) {
  if (typeof input === 'string') {
    input = input.trim();
  }
  if (input === '' || input === null || input === undefined) {
    return fallback;
  }
  const numericValue = Number(input);
  if (!Number.isInteger(numericValue)) {
    return fallback;
  }
  if (numericValue < MIN_QUANTITY || numericValue > MAX_QUANTITY) {
    return fallback;
  }
  return numericValue;
}

export function findProduct(productId) {
  return PRODUCTS.find(p => p.id === productId) || null;
}

export function addItem(cart, productId) {
  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    const nextQty = Math.min(existing.quantity + 1, MAX_QUANTITY);
    return cart.map(item => item.productId === productId ? { ...item, quantity: nextQty } : item);
  }
  return [...cart, { productId, quantity: 1 }];
}

export function setItemQuantity(cart, productId, requestedQuantity, fallback = 1) {
  const validQuantity = clampQuantity(requestedQuantity, fallback);
  return cart.map(item => item.productId === productId ? { ...item, quantity: validQuantity } : item);
}

export function removeItem(cart, productId) {
  return cart.filter(item => item.productId !== productId);
}

export function calculateLineTotal(item) {
  const product = findProduct(item.productId);
  if (!product) return 0;
  return product.pricePaise * item.quantity;
}

export function calculateOrderTotal(cart) {
  return cart.reduce((total, item) => total + calculateLineTotal(item), 0);
}

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Generates an unguessable 8-character reference with no ambiguous characters (0, O, 1, I).
export function generateOrderReference() {
  const randomBytes = new Uint8Array(8);
  crypto.getRandomValues(randomBytes);
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += REF_ALPHABET[randomBytes[i] % REF_ALPHABET.length];
  }
  return `ORD-${code}`;
}
