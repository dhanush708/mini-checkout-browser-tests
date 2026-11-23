# Test Plan: Mini Checkout

## 1. Scope
The test scope covers client-side checkout behavior for North Ledger Stationery:
- Adding and removing synthetic catalog items.
- Line quantity adjustments (1 to 20) and immediate line/order total recalculation.
- Money formatting with exact integer paise arithmetic.
- Field validation (blank and whitespace name checks, empty cart checks, focus management).
- Single order confirmation generation with unique reference.
- Double-submission prevention and state locking post-order.
- Accessibility standards and responsive layout at 375px and 1280px.

## 2. Out of Scope
- Backend APIs, databases, authentication, user accounts, and session persistence.
- Payment gateway processing, shipping calculations, tax rates, and discount codes.
- LocalStorage caching, service workers, and offline sync.

## 3. Risk Assessment Matrix (Ranked by Likelihood x Impact)

| Rank | Risk Description | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Wrong total from floating point math | High | High | Integer paise arithmetic, strict string formatting |
| 2 | Duplicate order from rapid double-click | High | High | Synchronous state guard plus button disable |
| 3 | Empty cart accepted for checkout | Med | High | Pre-submit cart length validation |
| 4 | Blank or whitespace name accepted | Med | Med | Name trim validation before checkout |
| 5 | Customer input wiped on validation failure | Med | Med | Preserve input field value on validation error |
| 6 | Invalid quantity inputs (0, negative, >20, text) | Med | Med | Pure clampQuantity function with revert |
| 7 | Cart modifications permitted after order placed | Med | Med | Disable all inputs and action buttons on success |
| 8 | Missing or malformed reference ID | Low | High | Cryptographic random generation against format regex |
| 9 | Unsafe name reflection (XSS) | Low | High | Use textContent exclusively for user name rendering |
| 10 | Keyboard-only submission blocked | Med | Med | Listen to form submit event triggered by Enter key |
| 11 | Viewport overflow on mobile devices | Med | Low | CSS grid layout, responsive table wrapper, min-width: 0 |

## 4. Test Cases and Automation Mapping

| Test ID | Title | Method | Automated Spec / Target |
| :--- | :--- | :--- | :--- |
| TC-01 | Order placement and confirmation reference | Automated | `tests/checkout.spec.js` (Required Check 1) |
| TC-02 | Blank name validation with cart preservation | Automated | `tests/checkout.spec.js` (Required Check 2) |
| TC-03 | Live total updates on quantity changes | Automated | `tests/checkout.spec.js` (Required Check 3) |
| TC-04 | Empty cart checkout blocked with typed name preserved | Automated | `tests/checkout.spec.js` (Risk Check 4) |
| TC-05 | Double-click idempotency check | Automated | `tests/checkout.spec.js` (Risk Check 5) |
| TC-06 | Same-tick double click programmatic invocation | Automated | `tests/checkout.spec.js` (Risk Check 6) |
| TC-07 | Quantity clamp and revert on invalid inputs | Automated | `tests/checkout.spec.js` (Risk Check 7) |
| TC-08 | Enter-key form submission with blank name | Automated | `tests/checkout.spec.js` (Risk Check 8) |
| TC-09 | Mobile viewport horizontal overflow prevention | Automated | `tests/checkout.spec.js` (Regression DEF-01) |
| MAN-01 | Manual verification of empty cart submission | Manual | `docs/MANUAL_TESTS.md` (Designated for Dhanush) |
| MAN-02 | Manual verification of rapid button double-click | Manual | `docs/MANUAL_TESTS.md` (Designated for Dhanush) |

## 5. Test Environments
- Operating System: Windows 11 (tested locally), cross-compatible with macOS and Linux.
- Runtimes: Node.js v26.13.0, npm 11.20.0, Git 2.56.0.
- Browsers: Chromium 159.0.8154.6, Firefox 159.0, WebKit 27.2 (via Playwright 1.65.1).
