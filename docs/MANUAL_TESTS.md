# Manual tests

I ran these manual test cases by hand in Chrome on Windows 11 on 23 Nov 2026 on the final build served with `npm start`. I did not record the Chrome version.

---

## MAN-01: Empty cart checkout attempt

- **Test ID**: MAN-01
- **Title**: Place Order with an empty cart
- **Status**: PASS
- **Tester**: Dhanush A
- **Browser**: Chrome on Windows 11 (version not recorded)
- **Date**: 23 Nov 2026

### Preconditions
1. Open the application in a clean browser window at `http://localhost:8080/`.
2. Confirm the cart starts empty with the message "Your cart is empty." and total ₹0.00.

### Steps
1. With an empty cart, type "Asha Verma" in the Full name field and click Place Order.
2. With an empty cart and name left blank, click Place Order.
3. Add an item to the cart, remove it again so the cart is empty, and click Place Order.

### Expected result
- The order does not go through and no confirmation is displayed.
- Step 1: "Add at least one item to your cart." appears, typed name stays in the field.
- Step 2: Both "Add at least one item to your cart." and "Enter your name to place the order." appear, name field outlined in red.
- Step 3: Both messages appear again, no confirmation.
- The Place Order button stays enabled throughout.

### Execution record
- **Step 1**: Typed "Asha Verma", clicked Place Order. The message "Add at least one item to your cart." appeared, no confirmation, the name stayed in the field.
  - Evidence: [docs/evidence/man-01-name-kept.png](evidence/man-01-name-kept.png)
- **Step 2**: Left name blank, clicked Place Order. Both messages appeared ("Add at least one item to your cart." and "Enter your name to place the order."), the name field was outlined in red, no confirmation.
  - Evidence: [docs/evidence/man-01-empty-cart.png](evidence/man-01-empty-cart.png)
- **Step 3**: Added an item, removed it again, clicked Place Order. Both messages appeared again, no confirmation.
  - Evidence: [docs/evidence/man-01-add-remove.png](evidence/man-01-add-remove.png)
- **Actual result**: Pass. All three steps matched expected results. No defects found.

---

## MAN-02: Rapid double-click on Place Order

- **Test ID**: MAN-02
- **Title**: Double-click Place Order to check for duplicate orders
- **Status**: PASS (single attempt)
- **Tester**: Dhanush A
- **Browser**: Chrome on Windows 11 (version not recorded)
- **Date**: 23 Nov 2026

### Preconditions
1. Open the application at `http://localhost:8080/`.
2. Add at least one item to the cart.
3. Enter a valid customer name.

### Steps
1. Navigate to `http://localhost:8080/`.
2. Click Add to cart on A5 Dotted Notebook.
3. Click the Full name field and type "Asha Verma".
4. Try to click Place Order twice as quickly as possible (one attempt).

### Expected result
- Exactly one order confirmation appears.
- A single reference code in the format `ORD-XXXXXXXX` is generated.
- The button text changes to "Order placed" and the button becomes disabled.
- The second click does nothing.
- The cart controls and name field become disabled.

### Execution record
- **Attempt 1**: Added an item, typed "Asha Verma" and tried to click Place Order twice. The first click placed the order. The button turned grey and read "Order placed", so the second click did nothing. One confirmation appeared with reference ORD-BMUNQP2T.
  - Evidence: [docs/evidence/man-02-double-click.png](evidence/man-02-double-click.png)
- **Actual result**: Pass. Exactly one confirmation and reference generated. No duplicate orders.

### Untested variants (NOT RUN)
- Repeating the double-click five times: NOT RUN
- Trying a triple-click: NOT RUN
- Pressing Enter twice quickly: NOT RUN
- Pressing Enter and then clicking: NOT RUN
