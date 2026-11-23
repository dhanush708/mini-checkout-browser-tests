export class CheckoutPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Headings and store layout
    this.storeHeading = page.getByRole('heading', { level: 1, name: 'North Ledger Stationery' });
    this.emptyCartNotice = page.getByText('Your cart is empty.');

    // Totals (allowed data-testids)
    this.orderTotal = page.getByTestId('order-total');

    // Checkout form inputs and buttons
    this.nameInput = page.getByLabel('Full name');
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
    this.orderPlacedButton = page.getByRole('button', { name: 'Order placed' });
    this.startNewOrderButton = page.getByRole('button', { name: 'Start a new order' });

    // Validation messages
    this.emptyCartError = page.getByText('Add at least one item to your cart.');
    this.blankNameError = page.getByText('Enter your name to place the order.');

    // Confirmation elements (allowed data-testids & roles)
    this.confirmation = page.getByTestId('confirmation');
    this.confirmationStatus = page.getByRole('status');
    this.reference = page.getByTestId('reference');
  }

  async goto() {
    await this.page.goto('/');
  }

  getProductCard(productName) {
    return this.page.getByRole('listitem').filter({ hasText: productName });
  }

  async addProduct(productName) {
    const card = this.getProductCard(productName);
    await card.getByRole('button', { name: 'Add to cart' }).click();
  }

  getCartRow(productName) {
    return this.page.getByRole('row').filter({ hasText: productName });
  }

  getQuantityInput(productName) {
    const row = this.getCartRow(productName);
    return row.getByRole('spinbutton', { name: 'Quantity' });
  }

  getLineTotal(testId) {
    return this.page.getByTestId(testId);
  }

  async setQuantity(productName, quantity) {
    const input = this.getQuantityInput(productName);
    await input.fill(String(quantity));
  }

  async incrementQuantity(productName) {
    const row = this.getCartRow(productName);
    await row.getByRole('button', { name: 'Increase quantity' }).click();
  }

  async decrementQuantity(productName) {
    const row = this.getCartRow(productName);
    await row.getByRole('button', { name: 'Decrease quantity' }).click();
  }

  async removeItem(productName) {
    const row = this.getCartRow(productName);
    await row.getByRole('button', { name: 'Remove' }).click();
  }

  async fillName(name) {
    await this.nameInput.fill(name);
  }

  async placeOrder() {
    await this.placeOrderButton.click();
  }

  async submitViaEnter() {
    await this.nameInput.press('Enter');
  }

  async startNewOrder() {
    await this.startNewOrderButton.click();
  }
}
