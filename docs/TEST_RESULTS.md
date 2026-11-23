# Test results

- **Date**: 2026-11-23
- **Tester**: Dhanush A
- **Environment**: Windows 11, Node v26.13.0, npm 11.20.0, Git 2.56.0, Playwright 1.65.1

---

## Automated test execution

### Default Chromium suite (`npm test`)
- Command: `npx playwright test --project=chromium`
- Total tests: 10
- Passed: 10
- Failed: 0
- Time: 2.6s
- Evidence: [docs/evidence/test-run-chromium.txt](evidence/test-run-chromium.txt)

| Test ID | Test name | Browser | Result |
| :--- | :--- | :--- | :--- |
| TC-01 | places an order and shows a single confirmation reference | Chromium | PASS |
| TC-02 | blocks checkout when the name is blank and keeps the cart | Chromium | PASS |
| TC-03 | updates line and order totals exactly when a quantity changes | Chromium | PASS |
| TC-04 | blocks checkout on empty cart with exact message and preserves typed name | Chromium | PASS |
| TC-05 | double-click on Place Order gives exactly one confirmation and reference stays the same | Chromium | PASS |
| TC-06 | two clicks in the same tick still give one confirmation | Chromium | PASS |
| TC-07 | reverts invalid quantity inputs (0, abc, 21) to last valid value | Chromium | PASS |
| TC-08 | blocks Enter-key submission when name is blank | Chromium | PASS |
| TC-09 | prevents horizontal viewport overflow at 375px mobile breakpoint (regression DEF-01) | Chromium | PASS |
| TC-10 | ensures cart has no horizontal overflow and Remove button is fully visible at 1280px and 375px (regression DEF-02) | Chromium | PASS |

---

### Cross-browser suite (`npm run test:all-browsers`)
- Command: `playwright test --project=chromium --project=firefox --project=webkit`
- Total tests: 30 (10 tests x 3 browsers)
- Passed: 30
- Failed: 0
- Time: 17.7s
- Evidence: [docs/evidence/test-run-all-browsers.txt](evidence/test-run-all-browsers.txt)

| Browser | Passed | Failed | Status |
| :--- | :--- | :--- | :--- |
| Chromium (Desktop Chrome) | 10 / 10 | 0 | PASS |
| Firefox (Desktop Firefox) | 10 / 10 | 0 | PASS |
| WebKit (Desktop Safari) | 10 / 10 | 0 | PASS |

---

### Stability suite (`npm run test:stability`)
- Command: `playwright test --project=chromium --repeat-each=10`
- Total test runs: 100
- Passed: 100
- Failed: 0
- Flaky: 0
- Time: 24.8s
- Evidence: [docs/evidence/test-run-stability.txt](evidence/test-run-stability.txt)

Every test passed on all 10 iterations with zero flakiness.

---

## Breaking the app on purpose

To confirm my tests catch real regressions, I tested intentional mutations on throwaway edits and reverted them:

1. **Price math mutation**: Changed notebook price from 24990 to 25000 paise in [app/js/cart.js](../app/js/cart.js).
   - Result: TC-03 failed as expected (`Expected: "₹749.70", Received: "₹750.00"`).
   - Reverted via git.

2. **Empty cart guard mutation**: Set `isCartEmpty = false` in `handleCheckout` in [app/js/main.js](../app/js/main.js).
   - Result: TC-04 failed as expected (`Error: expect(locator).toBeVisible() failed for empty cart error`).
   - Reverted via git.

3. **Double submission guard mutation**: Commented out the state flag check and allowed duplicate cards in `renderConfirmation`.
   - Result: TC-05 failed as expected (`Expected: 1, Received: 2`).
   - Reverted via git.

---

## Scripted probes

I ran scripted exploratory checks to verify edge behaviors:

| Probe | Condition | Result | What happened |
| :--- | :--- | :--- | :--- |
| 1 | Whitespace-only name (`"     "`) | PASS | Blocked with "Enter your name to place the order.", cart kept |
| 2 | Enter key form submit | PASS | Order placed, created reference format `ORD-XXXXXXXX` |
| 3 | Quantity invalid inputs | PASS | `-5` -> 1, `0` -> 1, `21` -> 1, `2.5` -> 1 via clampQuantity |
| 4 | Controls locked after order placed | PASS | Form inputs, submit button, and cart controls disabled |
| 5 | Remove last item then place order | PASS | Cart becomes empty, blocked with empty cart error |
| 6 | Name containing HTML tags (`<b>Asha</b>`) | PASS | Rendered safely as text via textContent |
| 7 | Viewport overflow check (320px to 1920px) | PASS | No horizontal scrolling on page or cart area |

The probe script was a throwaway and is not in the repo, so those seven results cannot be re-run.

---

## Manual tests

I ran two manual tests by hand in Chrome on Windows 11 on 23 Nov 2026 on the final build served with `npm start` (I did not record the Chrome version). Full steps and execution records are in [docs/MANUAL_TESTS.md](MANUAL_TESTS.md).

| Test ID | Test name | Browser | Result | Evidence |
| :--- | :--- | :--- | :--- | :--- |
| MAN-01 | Empty cart checkout attempt (three steps) | Chrome (Windows 11) | PASS | [docs/evidence/man-01-name-kept.png](evidence/man-01-name-kept.png), [docs/evidence/man-01-empty-cart.png](evidence/man-01-empty-cart.png), [docs/evidence/man-01-add-remove.png](evidence/man-01-add-remove.png) |
| MAN-02 | Rapid double-click on Place Order (one attempt) | Chrome (Windows 11) | PASS | [docs/evidence/man-02-double-click.png](evidence/man-02-double-click.png) |

Both tests passed and matched expected results. Reference ORD-BMUNQP2T was generated on MAN-02. No defects were found by hand.

Not done: I only tried the double-click once. I did not repeat it five times, try a triple-click, press Enter twice or press Enter and then click, so those variants have no manual result.

---

## Defects found and resolved

Full steps, reproduction details, and evidence links are in [docs/DEFECTS.md](DEFECTS.md):

1. **DEF-01: Horizontal overflow on mobile viewports (375px)**
   - Problem: Unconstrained table columns forced document width past 375px.
   - Resolution: Wrapped table in container, set `min-width: 0` on grid columns, added mobile padding adjustments. Verified via regression test TC-09.

2. **DEF-02: Cart table horizontal scroll and clipped controls on desktop viewports**
   - Problem: Found by hand in Chrome. The right order column was only 384px wide, causing the 434px cart table to scroll horizontally, clip the Remove button by 42px, and wrap product names onto multiple lines.
   - Resolution: Widened page container to 1120px max-width, set two-column breakpoint at 900px (allocating over 550px for the cart), and stacked cart rows as cards at 600px and below. Verified via regression test TC-10 across 1280px and 375px.
