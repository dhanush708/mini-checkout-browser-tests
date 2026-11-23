import { 
  PRODUCTS, 
  addItem, 
  setItemQuantity, 
  removeItem, 
  calculateLineTotal, 
  calculateOrderTotal, 
  generateOrderReference,
  clampQuantity,
  findProduct
} from './cart.js';
import { formatPaise } from './money.js';

// Application state
let cart = [];
let isSubmitting = false;
let isOrderPlaced = false;

// DOM Elements
const productList = document.getElementById('product-list');
const emptyCartMessage = document.getElementById('empty-cart-message');
const cartTable = document.getElementById('cart-table');
const cartItemsBody = document.getElementById('cart-items-body');
const orderTotalDisplay = document.getElementById('order-total-display');
const validationErrors = document.getElementById('validation-errors');
const checkoutForm = document.getElementById('checkout-form');
const nameInput = document.getElementById('customer-name');
const placeOrderBtn = document.getElementById('place-order-btn');
const confirmationContainer = document.getElementById('confirmation-container');

function renderCatalog() {
  productList.innerHTML = '';
  PRODUCTS.forEach(product => {
    const li = document.createElement('li');
    li.className = 'product-card';
    li.innerHTML = `
      <div class="product-header">
        <h3 class="product-title">${product.name}</h3>
        <span class="product-price">${formatPaise(product.pricePaise)}</span>
      </div>
      <p class="product-desc">${product.description}</p>
      <button type="button" class="btn-secondary" data-action="add" data-id="${product.id}">
        Add to cart
      </button>
    `;
    productList.appendChild(li);
  });
}

function renderCart() {
  const totalPaise = calculateOrderTotal(cart);
  orderTotalDisplay.textContent = formatPaise(totalPaise);

  if (cart.length === 0) {
    emptyCartMessage.hidden = false;
    cartTable.hidden = true;
    cartItemsBody.innerHTML = '';
    return;
  }

  emptyCartMessage.hidden = true;
  cartTable.hidden = false;
  cartItemsBody.innerHTML = '';

  cart.forEach(item => {
    const product = findProduct(item.productId);
    if (!product) return;

    const lineTotal = calculateLineTotal(item);
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.textContent = product.name;
    tr.appendChild(tdName);

    const tdPrice = document.createElement('td');
    tdPrice.className = 'col-money';
    tdPrice.textContent = formatPaise(product.pricePaise);
    tr.appendChild(tdPrice);

    const tdQty = document.createElement('td');
    const qtyWrap = document.createElement('div');
    qtyWrap.className = 'quantity-controls';

    const decBtn = document.createElement('button');
    decBtn.type = 'button';
    decBtn.className = 'btn-qty';
    decBtn.textContent = '-';
    decBtn.setAttribute('aria-label', 'Decrease quantity');
    decBtn.disabled = isOrderPlaced;
    decBtn.addEventListener('click', () => {
      if (isOrderPlaced) return;
      const nextQty = Math.max(1, item.quantity - 1);
      cart = setItemQuantity(cart, item.productId, nextQty, item.quantity);
      renderCart();
    });
    qtyWrap.appendChild(decBtn);

    const qtyInput = document.createElement('input');
    qtyInput.type = 'text';
    qtyInput.inputMode = 'numeric';
    qtyInput.setAttribute('role', 'spinbutton');
    qtyInput.setAttribute('aria-valuenow', String(item.quantity));
    qtyInput.setAttribute('aria-valuemin', '1');
    qtyInput.setAttribute('aria-valuemax', '20');
    qtyInput.className = 'qty-input';
    qtyInput.value = String(item.quantity);
    qtyInput.setAttribute('aria-label', 'Quantity');
    qtyInput.disabled = isOrderPlaced;

    // Direct quantity input with immediate update and automatic revert
    const handleQtyUpdate = (e) => {
      if (isOrderPlaced) return;
      const valid = clampQuantity(e.target.value, item.quantity);
      cart = setItemQuantity(cart, item.productId, valid, item.quantity);
      renderCart();
    };
    qtyInput.addEventListener('input', handleQtyUpdate);
    qtyInput.addEventListener('change', handleQtyUpdate);
    qtyInput.addEventListener('blur', handleQtyUpdate);

    qtyWrap.appendChild(qtyInput);

    const incBtn = document.createElement('button');
    incBtn.type = 'button';
    incBtn.className = 'btn-qty';
    incBtn.textContent = '+';
    incBtn.setAttribute('aria-label', 'Increase quantity');
    incBtn.disabled = isOrderPlaced;
    incBtn.addEventListener('click', () => {
      if (isOrderPlaced) return;
      const nextQty = Math.min(20, item.quantity + 1);
      cart = setItemQuantity(cart, item.productId, nextQty, item.quantity);
      renderCart();
    });
    qtyWrap.appendChild(incBtn);

    tdQty.appendChild(qtyWrap);
    tr.appendChild(tdQty);

    const tdTotal = document.createElement('td');
    tdTotal.className = 'col-money';
    tdTotal.setAttribute('data-testid', product.testId);
    tdTotal.textContent = formatPaise(lineTotal);
    tr.appendChild(tdTotal);

    const tdAction = document.createElement('td');
    const rmBtn = document.createElement('button');
    rmBtn.type = 'button';
    rmBtn.className = 'btn-secondary';
    rmBtn.textContent = 'Remove';
    rmBtn.setAttribute('aria-label', 'Remove');
    rmBtn.disabled = isOrderPlaced;
    rmBtn.addEventListener('click', () => {
      if (isOrderPlaced) return;
      cart = removeItem(cart, item.productId);
      renderCart();
    });
    tdAction.appendChild(rmBtn);
    tr.appendChild(tdAction);

    cartItemsBody.appendChild(tr);
  });
}

function handleAddToCart(productId) {
  if (isOrderPlaced) return;
  cart = addItem(cart, productId);
  // Clear empty cart error if user adds an item
  if (cart.length > 0) {
    clearErrors();
  }
  renderCart();
}

function clearErrors() {
  validationErrors.hidden = true;
  validationErrors.innerHTML = '';
  nameInput.removeAttribute('aria-invalid');
}

function handleCheckout() {
  // Synchronous double-submission state guard
  if (isSubmitting || isOrderPlaced) {
    return;
  }
  isSubmitting = true;

  const rawName = nameInput.value;
  const isNameBlank = rawName.trim().length === 0;
  const isCartEmpty = cart.length === 0;

  if (isCartEmpty || isNameBlank) {
    isSubmitting = false;
    validationErrors.innerHTML = '';
    const errorMessages = [];

    if (isCartEmpty) {
      errorMessages.push('Add at least one item to your cart.');
    }
    if (isNameBlank) {
      errorMessages.push('Enter your name to place the order.');
      nameInput.setAttribute('aria-invalid', 'true');
    } else {
      nameInput.removeAttribute('aria-invalid');
    }

    errorMessages.forEach(msg => {
      const p = document.createElement('p');
      p.textContent = msg;
      validationErrors.appendChild(p);
    });

    validationErrors.hidden = false;

    // Focus the first problem without altering raw inputs
    if (isCartEmpty) {
      const firstCatalogBtn = productList.querySelector('button');
      if (firstCatalogBtn) firstCatalogBtn.focus();
    } else if (isNameBlank) {
      nameInput.focus();
    }
    return;
  }

  // Valid order placement
  isOrderPlaced = true;
  isSubmitting = false;
  clearErrors();

  const ref = generateOrderReference();
  const orderTotalPaise = calculateOrderTotal(cart);

  // Lock form and controls
  nameInput.disabled = true;
  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = 'Order placed';
  renderCart();

  // Safely display confirmation using textContent (prevent XSS)
  renderConfirmation(ref, rawName.trim(), orderTotalPaise);
}

function renderConfirmation(ref, customerName, totalPaise) {
  confirmationContainer.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'confirmation-card';
  card.setAttribute('role', 'status');
  card.setAttribute('data-testid', 'confirmation');

  const title = document.createElement('h3');
  title.textContent = 'Order Confirmed';
  card.appendChild(title);

  const intro = document.createElement('p');
  intro.textContent = 'Thank you for your order. We have prepared your receipt:';
  card.appendChild(intro);

  const list = document.createElement('ul');
  list.className = 'confirmation-details';

  const liRef = document.createElement('li');
  liRef.textContent = 'Reference: ';
  const refSpan = document.createElement('span');
  refSpan.id = 'confirmation-ref';
  refSpan.setAttribute('data-testid', 'reference');
  refSpan.textContent = ref;
  liRef.appendChild(refSpan);
  list.appendChild(liRef);

  const liName = document.createElement('li');
  liName.textContent = 'Customer: ';
  const nameSpan = document.createElement('span');
  nameSpan.id = 'confirmation-name';
  nameSpan.textContent = customerName;
  liName.appendChild(nameSpan);
  list.appendChild(liName);

  const liTotal = document.createElement('li');
  liTotal.textContent = 'Total paid: ';
  const totalSpan = document.createElement('span');
  totalSpan.id = 'confirmation-total';
  totalSpan.textContent = formatPaise(totalPaise);
  liTotal.appendChild(totalSpan);
  list.appendChild(liTotal);

  card.appendChild(list);

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'btn-secondary';
  resetBtn.textContent = 'Start a new order';
  resetBtn.addEventListener('click', () => {
    resetOrder();
  });
  card.appendChild(resetBtn);

  confirmationContainer.appendChild(card);
}

function resetOrder() {
  cart = [];
  isSubmitting = false;
  isOrderPlaced = false;

  nameInput.value = '';
  nameInput.disabled = false;
  placeOrderBtn.disabled = false;
  placeOrderBtn.textContent = 'Place Order';

  confirmationContainer.innerHTML = '';
  clearErrors();
  renderCart();
}

// Event Listeners
productList.addEventListener('click', (e) => {
  const target = e.target.closest('button[data-action="add"]');
  if (target) {
    handleAddToCart(target.getAttribute('data-id'));
  }
});

checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  handleCheckout();
});

// Initial boot
renderCatalog();
renderCart();
