# Manual Test Plan & Execution Records

This document defines manual test procedures reserved for human execution. Per instructions, these cases are designated for the candidate (Dhanush) to execute and record during exploratory validation.

---

## Test Case MAN-01: Empty cart checkout attempt

- **Test ID**: MAN-01
- **Title**: Attempt order placement with an empty cart
- **Status**: NOT RUN

### Preconditions
1. Clean browser session opened at `http://localhost:8080/`.
2. Initial pristine state verified: "Your cart is empty." is visible and total is ₹0.00.

### Execution Steps
1. Navigate to `http://localhost:8080/`.
2. Do not add any products to the cart.
3. Click inside the "Full name" field and enter `Dhanush Anbu`.
4. Click the "Place Order" button once.

### Expected Result
- Order is blocked.
- Validation message displays: `Add at least one item to your cart.`.
- Focus moves to the product catalog to guide item selection.
- The typed name `Dhanush Anbu` is preserved in the input without truncation or trimming.
- No confirmation card is rendered.
- "Place Order" button remains enabled.

### Observation & Execution Record
- **Actual Result**: [NOT RUN - To be recorded by Dhanush]
- **Evidence File**: [NOT RUN - Attach screenshot or video timestamp]
- **Tester**: [Dhanush]
- **Date**: [NOT RUN]

---

## Test Case MAN-02: Rapid double-click on Place Order button

- **Test ID**: MAN-02
- **Title**: Rapid double-click submission to verify idempotency
- **Status**: NOT RUN

### Preconditions
1. Clean browser session opened at `http://localhost:8080/`.
2. At least one item added to the cart.
3. Valid name entered in the "Full name" field.

### Execution Steps
1. Navigate to `http://localhost:8080/`.
2. Click "Add to cart" on "A5 Dotted Notebook" (Total shows ₹249.90).
3. Click inside the "Full name" field and enter `Dhanush Anbu`.
4. Rapidly double-click the primary "Place Order" button with the mouse.

### Expected Result
- Exactly one order confirmation card is created in the DOM.
- A single reference matching format `ORD-[A-HJ-NP-Z2-9]{8}` is displayed.
- The reference remains static (no secondary reference is generated).
- "Place Order" button transitions to "Order placed" and becomes disabled.
- Cart controls and name input become disabled.

### Observation & Execution Record
- **Actual Result**: [NOT RUN - To be recorded by Dhanush]
- **Evidence File**: [NOT RUN - Attach screenshot or video timestamp]
- **Tester**: [Dhanush]
- **Date**: [NOT RUN]
