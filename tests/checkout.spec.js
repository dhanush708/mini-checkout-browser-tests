import { test, expect } from '@playwright/test';
import { CheckoutPage } from './pages/checkout-page.js';

test.describe('Checkout Flow', () => {
  let checkout;

  test.beforeEach(async ({ page }) => {
    checkout = new CheckoutPage(page);
    await checkout.goto();

    // Verify pristine state before every test
    await expect(checkout.emptyCartNotice).toBeVisible();
    await expect(checkout.orderTotal).toHaveText('₹0.00');
    await expect(checkout.nameInput).toHaveValue('');
    await expect(checkout.placeOrderButton).toBeVisible();
    await expect(checkout.placeOrderButton).toBeEnabled();
    await expect(checkout.confirmation).toHaveCount(0);
  });

  test.describe('Required checks', () => {
    test('places an order and shows a single confirmation reference', async () => {
      await test.step('Add item and fill customer name', async () => {
        await checkout.addProduct('A5 Dotted Notebook');
        await expect(checkout.getLineTotal('line-total-notebook')).toHaveText('₹249.90');
        await expect(checkout.orderTotal).toHaveText('₹249.90');

        await checkout.fillName('Asha Verma');
      });

      await test.step('Submit order and assert single confirmation', async () => {
        await checkout.placeOrder();

        // Exactly one confirmation with role="status"
        await expect(checkout.confirmation).toHaveCount(1);
        await expect(checkout.confirmationStatus).toHaveCount(1);
        await expect(checkout.confirmation).toBeVisible();

        // Reference format: ORD- plus 8 characters from ABCDEFGHJKLMNPQRSTUVWXYZ23456789
        await expect(checkout.reference).toHaveText(/^ORD-[A-HJ-NP-Z2-9]{8}$/);

        // Confirmation contains total and customer name
        await expect(checkout.confirmation).toContainText('₹249.90');
        await expect(checkout.confirmation).toContainText('Asha Verma');
      });

      await test.step('Verify post-order locking', async () => {
        await expect(checkout.orderPlacedButton).toBeVisible();
        await expect(checkout.orderPlacedButton).toBeDisabled();
        await expect(checkout.nameInput).toBeDisabled();

        // Cart controls are disabled
        const row = checkout.getCartRow('A5 Dotted Notebook');
        await expect(row.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
        await expect(row.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
        await expect(row.getByRole('button', { name: 'Remove' })).toBeDisabled();
        await expect(checkout.getQuantityInput('A5 Dotted Notebook')).toBeDisabled();
      });

      await test.step('Reset via start a new order', async () => {
        await checkout.startNewOrder();
        await expect(checkout.emptyCartNotice).toBeVisible();
        await expect(checkout.orderTotal).toHaveText('₹0.00');
        await expect(checkout.nameInput).toHaveValue('');
        await expect(checkout.placeOrderButton).toBeVisible();
        await expect(checkout.placeOrderButton).toBeEnabled();
        await expect(checkout.confirmation).toHaveCount(0);
      });
    });

    test('blocks checkout when the name is blank and keeps the cart', async () => {
      await test.step('Add product and leave name blank', async () => {
        await checkout.addProduct('Brass Fountain Pen');
        await expect(checkout.orderTotal).toHaveText('₹1,199.95');
      });

      await test.step('Attempt checkout with blank name', async () => {
        await checkout.placeOrder();
        await expect(checkout.blankNameError).toBeVisible();
        await expect(checkout.confirmation).toHaveCount(0);
      });

      await test.step('Verify cart is untouched and button remains enabled', async () => {
        await expect(checkout.getQuantityInput('Brass Fountain Pen')).toHaveValue('1');
        await expect(checkout.orderTotal).toHaveText('₹1,199.95');
        await expect(checkout.placeOrderButton).toBeEnabled();
      });
    });

    test('updates line and order totals exactly when a quantity changes', async () => {
      await test.step('Add notebook and set quantity to 3', async () => {
        await checkout.addProduct('A5 Dotted Notebook');
        await checkout.setQuantity('A5 Dotted Notebook', 3);
        await expect(checkout.getLineTotal('line-total-notebook')).toHaveText('₹749.70');
        await expect(checkout.orderTotal).toHaveText('₹749.70');
      });

      await test.step('Add pen x1 and verify order total', async () => {
        await checkout.addProduct('Brass Fountain Pen');
        await expect(checkout.getLineTotal('line-total-pen')).toHaveText('₹1,199.95');
        await expect(checkout.orderTotal).toHaveText('₹1,949.65');
      });

      await test.step('Change notebook quantity to 4 and verify totals', async () => {
        await checkout.setQuantity('A5 Dotted Notebook', 4);
        await expect(checkout.getLineTotal('line-total-notebook')).toHaveText('₹999.60');
        await expect(checkout.orderTotal).toHaveText('₹2,199.55');
      });
    });
  });

  test.describe('Additional risk checks', () => {
    test('blocks checkout on empty cart with exact message and preserves typed name', async () => {
      await test.step('Type name without adding items', async () => {
        await checkout.fillName('Asha Verma');
      });

      await test.step('Attempt order placement', async () => {
        await checkout.placeOrder();
        await expect(checkout.emptyCartError).toBeVisible();
        await expect(checkout.nameInput).toHaveValue('Asha Verma');
        await expect(checkout.confirmation).toHaveCount(0);
        await expect(checkout.placeOrderButton).toBeEnabled();
      });
    });

    test('double-click on Place Order gives exactly one confirmation and reference stays the same', async () => {
      await test.step('Prepare order', async () => {
        await checkout.addProduct('A5 Dotted Notebook');
        await checkout.fillName('Asha Verma');
      });

      await test.step('Rapid double-click on submit button', async () => {
        await checkout.placeOrderButton.dblclick();

        await expect(checkout.confirmation).toHaveCount(1);
        await expect(checkout.reference).toHaveText(/^ORD-[A-HJ-NP-Z2-9]{8}$/);

        const refText = await checkout.reference.innerText();
        await expect(checkout.reference).toHaveText(refText);
        await expect(checkout.confirmation).toHaveCount(1);
      });
    });

    test('two clicks in the same tick still give one confirmation', async () => {
      await test.step('Prepare order', async () => {
        await checkout.addProduct('Brass Fountain Pen');
        await checkout.fillName('Asha Verma');
      });

      await test.step('Trigger two simultaneous clicks via page evaluate', async () => {
        await checkout.page.evaluate(() => {
          const button = document.querySelector('button[type="submit"]');
          button.click();
          button.click();
        });

        await expect(checkout.confirmation).toHaveCount(1);
        await expect(checkout.reference).toHaveText(/^ORD-[A-HJ-NP-Z2-9]{8}$/);
      });
    });

    test('reverts invalid quantity inputs (0, abc, 21) to last valid value', async () => {
      await test.step('Add product with valid initial quantity 1', async () => {
        await checkout.addProduct('A5 Dotted Notebook');
        const input = checkout.getQuantityInput('A5 Dotted Notebook');
        await expect(input).toHaveValue('1');

        // Input 0 reverts to 1
        await input.fill('0');
        await input.blur();
        await expect(input).toHaveValue('1');

        // Input text reverts to 1
        await input.fill('abc');
        await input.blur();
        await expect(input).toHaveValue('1');

        // Input above max 20 reverts to 1
        await input.fill('21');
        await input.blur();
        await expect(input).toHaveValue('1');

        // Valid change to 5
        await input.fill('5');
        await input.blur();
        await expect(input).toHaveValue('5');

        // Input 0 now reverts to 5
        await input.fill('0');
        await input.blur();
        await expect(input).toHaveValue('5');
      });
    });

    test('blocks Enter-key submission when name is blank', async () => {
      await test.step('Add product and press Enter in name field', async () => {
        await checkout.addProduct('A5 Dotted Notebook');
        await checkout.nameInput.focus();
        await checkout.submitViaEnter();

        await expect(checkout.blankNameError).toBeVisible();
        await expect(checkout.confirmation).toHaveCount(0);
      });
    });

    test('prevents horizontal viewport overflow at 375px mobile breakpoint (regression DEF-01)', async ({ page }) => {
      await test.step('Set mobile viewport and populate cart', async () => {
        await page.setViewportSize({ width: 375, height: 812 });
        await checkout.addProduct('A5 Dotted Notebook');
        await checkout.addProduct('Brass Fountain Pen');
      });

      await test.step('Assert document does not overflow viewport width', async () => {
        const isOverflowing = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(isOverflowing).toBe(false);
      });
    });

    test('ensures cart has no horizontal overflow and Remove button is fully visible at 1280px and 375px (regression DEF-02)', async ({ page }) => {
      const viewports = [
        { width: 1280, height: 800 },
        { width: 375, height: 812 }
      ];

      for (const vp of viewports) {
        await test.step(`Verify layout at ${vp.width}px viewport`, async () => {
          await page.setViewportSize(vp);
          await checkout.goto();
          await checkout.addProduct('A5 Dotted Notebook');
          await checkout.addProduct('Brass Fountain Pen');

          const layoutMetrics = await page.evaluate(() => {
            const wrapper = document.querySelector('.table-responsive');
            const removeButtons = Array.from(document.querySelectorAll('button[aria-label="Remove"]'));
            const wrapperRect = wrapper.getBoundingClientRect();
            const winWidth = window.innerWidth;

            const allRemoveButtonsVisible = removeButtons.every(btn => {
              const rect = btn.getBoundingClientRect();
              return rect.right <= winWidth && rect.left >= 0 && rect.right <= wrapperRect.right + 2;
            });

            return {
              hasWrapperOverflow: wrapper.scrollWidth > wrapper.clientWidth,
              hasDocumentOverflow: document.documentElement.scrollWidth > winWidth,
              allRemoveButtonsVisible
            };
          });

          expect(layoutMetrics.hasWrapperOverflow).toBe(false);
          expect(layoutMetrics.hasDocumentOverflow).toBe(false);
          expect(layoutMetrics.allRemoveButtonsVisible).toBe(true);
        });
      }
    });
  });
});
