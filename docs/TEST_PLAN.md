# Test plan: Mini checkout

I wrote this test plan to verify the single-page checkout flow for North Ledger Stationery. My primary focus is to make sure checkout works correctly, calculation errors never reach customers, and common customer mistakes are handled cleanly.

---

## Scope

What I am testing:
- Adding and removing catalog products.
- Line quantity adjustments (1 to 20) with immediate subtotal and order total recalculation.
- Money calculations using integer paise arithmetic without floating point rounding errors.
- Form validation (blank name, whitespace-only name, empty cart, focus placement).
- Order confirmation with a single reference ID.
- Prevention of duplicate order submissions.
- Locking of the form and cart controls once an order is placed.
- Responsive layout across mobile and desktop widths (320px to 1920px).

## Out of scope

What I am not testing:
- Backend servers, databases, or API integrations.
- Payment gateway processing, shipping rates, taxes, or coupon codes.
- Local storage or session persistence across browser reloads.

## Risks and priority

I ranked these risks by how likely they are to happen and their impact on customer trust:

| Rank | Risk | Likelihood | Impact | How I mitigate it |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Wrong total due to floating point math | High | High | I store all prices in integer paise and format at render |
| 2 | Duplicate order on fast double-click | High | High | Synchronous state flag in submit handler plus button disable |
| 3 | Order placed with an empty cart | Med | High | Pre-submit check blocks empty carts and shows error |
| 4 | Order placed with blank or spaces name | Med | Med | Name trimmed before validation check |
| 5 | Typed name lost on validation failure | Med | Med | I keep the typed value intact without clearing |
| 6 | Invalid typed quantity (0, text, >20) | Med | Med | Pure clamp function reverts to last valid quantity |
| 7 | Cart table horizontal overflow | Med | Med | CSS-only card stacking below 600px, wide panel above 900px |
| 8 | Cart edited after placing order | Med | Med | All buttons and inputs disabled on success |
| 9 | Duplicate or missing reference code | Low | High | Crypto random values over safe 32-character alphabet |
| 10 | Script injection via customer name | Low | High | Name rendered strictly via textContent |
| 11 | Enter key does not submit | Med | Med | Form submit listener catches Enter key |

## Test cases

| ID | Title | Type | Target |
| :--- | :--- | :--- | :--- |
| TC-01 | Places an order and shows single confirmation reference | Automated | [tests/checkout.spec.js](../tests/checkout.spec.js) |
| TC-02 | Blocks checkout when name is blank and keeps cart | Automated | [tests/checkout.spec.js](../tests/checkout.spec.js) |
| TC-03 | Updates line and order totals exactly when quantity changes | Automated | [tests/checkout.spec.js](../tests/checkout.spec.js) |
| TC-04 | Blocks checkout on empty cart and preserves typed name | Automated | [tests/checkout.spec.js](../tests/checkout.spec.js) |
| TC-05 | Double-click on Place Order gives one confirmation | Automated | [tests/checkout.spec.js](../tests/checkout.spec.js) |
| TC-06 | Two clicks in same tick still give one confirmation | Automated | [tests/checkout.spec.js](../tests/checkout.spec.js) |
| TC-07 | Reverts invalid quantity inputs (0, abc, 21) to last valid value | Automated | [tests/checkout.spec.js](../tests/checkout.spec.js) |
| TC-08 | Blocks Enter-key submission when name is blank | Automated | [tests/checkout.spec.js](../tests/checkout.spec.js) |
| TC-09 | Prevents horizontal viewport overflow at 375px (DEF-01) | Automated | [tests/checkout.spec.js](../tests/checkout.spec.js) |
| TC-10 | Ensures no cart overflow and Remove fully visible at 1280px and 375px (DEF-02) | Automated | [tests/checkout.spec.js](../tests/checkout.spec.js) |
| MAN-01 | Empty cart checkout attempt | Manual | [docs/MANUAL_TESTS.md](MANUAL_TESTS.md) |
| MAN-02 | Rapid double-click on Place Order | Manual | [docs/MANUAL_TESTS.md](MANUAL_TESTS.md) |

## Test environment

- Operating System: Windows 11 (PowerShell)
- Runtimes: Node.js v26.13.0, npm 11.20.0, Git 2.56.0
- Browsers tested: Chromium, Firefox, WebKit (via Playwright)
