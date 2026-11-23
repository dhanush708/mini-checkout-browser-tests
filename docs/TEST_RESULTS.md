# Test Execution Results

- **Date**: 2026-11-23
- **Tester**: Dhanush Anbu (Fresher SDET candidate)
- **Environment**: Windows 11, Node v26.13.0, npm 11.20.0, Git 2.56.0.windows.4, Playwright 1.65.1

---

## 1. Automated Test Suite Execution Summary

### Chromium Test Run (`npm test`)
- Command: `npx playwright test --project=chromium`
- Workers: 8
- Total Tests: 9
- Passed: 9
- Failed: 0
- Execution Time: 4.5s
- Evidence Log: `docs/evidence/test-run-chromium.txt`

| Test ID | Test Name | Browser | Result | Duration |
| :--- | :--- | :--- | :--- | :--- |
| TC-01 | places an order and shows a single confirmation reference | Chromium | PASS | 1.8s |
| TC-02 | blocks checkout when the name is blank and keeps the cart | Chromium | PASS | 0.8s |
| TC-03 | updates line and order totals exactly when a quantity changes | Chromium | PASS | 1.1s |
| TC-04 | blocks checkout on empty cart with exact message and preserves typed name | Chromium | PASS | 0.7s |
| TC-05 | double-click on Place Order gives exactly one confirmation and reference stays the same | Chromium | PASS | 0.9s |
| TC-06 | two clicks in the same tick still give one confirmation | Chromium | PASS | 0.8s |
| TC-07 | reverts invalid quantity inputs (0, abc, 21) to last valid value | Chromium | PASS | 1.0s |
| TC-08 | blocks Enter-key submission when name is blank | Chromium | PASS | 0.7s |
| TC-09 | prevents horizontal viewport overflow at 375px mobile breakpoint (regression DEF-01) | Chromium | PASS | 0.6s |

---

### Cross-Browser Execution (`npm run test:all-browsers`)
- Command: `playwright test --project=chromium --project=firefox --project=webkit`
- Total Tests: 27 (9 tests x 3 browsers)
- Passed: 27
- Failed: 0
- Execution Time: 17.1s
- Evidence Log: `docs/evidence/test-run-all-browsers.txt`

| Browser | Passed | Failed | Status |
| :--- | :--- | :--- | :--- |
| Chromium (Desktop Chrome) | 9 / 9 | 0 | PASS |
| Firefox (Desktop Firefox) | 9 / 9 | 0 | PASS |
| WebKit (Desktop Safari) | 9 / 9 | 0 | PASS |

---

### Stability Run (`npm run test:stability`)
- Command: `playwright test --project=chromium --repeat-each=10`
- Total Test Executions: 90
- Passed: 90
- Failed: 0
- Flaky: 0
- Execution Time: 22.8s
- Evidence Log: `docs/evidence/test-run-stability.txt`
- Conclusion: Zero flakiness detected across 10 repeated iterations of each test.

---

## 2. Test Sensitivity Checks (Intentional Code Mutations)

These sensitivity checks verified that the test suite catches real breaking regressions. These are verification checks, not product defects.

### Sensitivity Check 1: Price Arithmetic Mutation
- Mutation: Changed notebook price from 24990 to 25000 paise in `app/js/cart.js`.
- Test Targeted: `updates line and order totals exactly when a quantity changes`
- Result: Test failed as expected across Chromium, Firefox, and WebKit.
- Observed Failure: `Locator: getByTestId('line-total-notebook'); Expected: "₹749.70", Received: "₹750.00"`.
- Action: Mutation reverted via git.

### Sensitivity Check 2: Empty Cart Guard Mutation
- Mutation: Set `isCartEmpty = false` inside `handleCheckout` in `app/js/main.js`.
- Test Targeted: `blocks checkout on empty cart with exact message and preserves typed name`
- Result: Test failed as expected across Chromium, Firefox, and WebKit.
- Observed Failure: `Error: expect(locator).toBeVisible() failed; Locator: getByText('Add at least one item to your cart.')`.
- Action: Mutation reverted via git.

### Sensitivity Check 3: Double Submission Guard Mutation
- Mutation: Commented out `if (isSubmitting || isOrderPlaced) return;` and allowed duplicate cards in `renderConfirmation`.
- Test Targeted: `double-click on Place Order gives exactly one confirmation and reference stays the same`
- Result: Test failed as expected across Chromium, Firefox, and WebKit.
- Observed Failure: `Error: expect(locator).toHaveCount(expected) failed; Expected: 1, Received: 2`.
- Action: Mutation reverted via git.

---

## 3. Scripted Exploratory Probes

Executed via Playwright script against the live application:

| Probe | Target Condition | Result | Observed Behavior |
| :--- | :--- | :--- | :--- |
| 1 | Whitespace-only name (`"     "`) | PASS | Blocked with "Enter your name to place the order.", cart preserved |
| 2 | Enter key form submit | PASS | Submits order, creates single reference (e.g. `ORD-CVFK9CGL`) |
| 3 | Quantity boundary and invalid input | PASS | `-5` -> 1, `0` -> 1, `21` -> 1, `2.5` -> 1 via clampQuantity |
| 4 | State locking after order placed | PASS | Form input, submit button, and cart quantity buttons disabled |
| 5 | Remove last item then order | PASS | Cart becomes empty, submit blocked with empty cart error |
| 6 | Name containing HTML tags (`<b>Dhanush</b>`) | PASS | Rendered as text via textContent, no HTML tags executed |
| 7 | Viewport width check at 375px | PASS (After DEF-01 fix) | `scrollWidth <= innerWidth`, zero horizontal overflow |

---

## 4. Manual Test Cases (Designated for Candidate)

Per instructions, manual testing belongs to the human tester (Dhanush).

| Test ID | Test Scenario | Status | Candidate Execution |
| :--- | :--- | :--- | :--- |
| MAN-01 | Empty cart checkout attempt | NOT RUN | Reserved for Dhanush to execute manually |
| MAN-02 | Rapid double-click submission check | NOT RUN | Reserved for Dhanush to execute manually |

Details and execution recording templates are in `docs/MANUAL_TESTS.md`.

---

## 5. Defects Identified and Remediation Record

One real defect was discovered during exploratory responsive probing:
- **DEF-01**: Mobile viewport horizontal overflow at 375px when items were in the cart.
- **Cause**: Unconstrained HTML table columns expanded beyond 375px viewport width.
- **Fix**: Wrapped table in `.table-responsive` container, set `min-width: 0` on grid columns, and applied compact padding on viewports under 480px.
- **Verification**: Regression test `TC-09` added to automated suite and passed across all browsers. Documented in `docs/DEFECTS.md`.
