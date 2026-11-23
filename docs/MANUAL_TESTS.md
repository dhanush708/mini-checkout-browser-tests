# Manual tests

I created two test cases that I will run by hand in the browser. They cover scenarios where manual verification gives me confidence before placing real orders.

---

## MAN-01: Empty cart checkout attempt

- **Test ID**: MAN-01
- **Title**: Place Order with an empty cart
- **Status**: NOT RUN

### Preconditions
1. Open the application in a clean browser window at `http://localhost:8080/`.
2. Confirm the cart starts empty with the message "Your cart is empty." and total ₹0.00.

### Steps
1. Navigate to `http://localhost:8080/`.
2. Leave the cart empty without adding any items.
3. Click the Full name field and type `Asha Verma`.
4. Click Place Order.

### Expected result
- The order does not go through.
- The error message "Add at least one item to your cart." appears.
- The typed name `Asha Verma` stays in the name field.
- The Place Order button stays enabled.
- No order confirmation is displayed.

### Execution record
- **Actual result**: <<FILL IN>>
- **Evidence file**: <<FILL IN>>
- **Tester**: Dhanush A
- **Date**: <<FILL IN>>

---

## MAN-02: Rapid double-click on Place Order

- **Test ID**: MAN-02
- **Title**: Double-click Place Order to check for duplicate orders
- **Status**: NOT RUN

### Preconditions
1. Open the application at `http://localhost:8080/`.
2. Add at least one item to the cart.
3. Enter a valid customer name.

### Steps
1. Navigate to `http://localhost:8080/`.
2. Click Add to cart on A5 Dotted Notebook.
3. Click the Full name field and type `Asha Verma`.
4. Double-click Place Order as quickly as possible.

### Expected result
- Exactly one order confirmation appears.
- A single reference code in the format `ORD-XXXXXXXX` is generated.
- The reference stays the same and does not flicker or regenerate.
- The button text changes to "Order placed" and the button becomes disabled.
- The cart controls and name field become disabled.

### Execution record
- **Actual result**: <<FILL IN>>
- **Evidence file**: <<FILL IN>>
- **Tester**: Dhanush A
- **Date**: <<FILL IN>>
