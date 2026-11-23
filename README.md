# Mini Checkout and Browser Test Suite

A small vanilla JavaScript checkout application and Playwright test suite for a synthetic stationery store, North Ledger Stationery.

Built for the Fynd SDET Intern track (Hiring Hackathon, Round 1).

"Built with AI assistance (Antigravity with ECC rules). I reviewed it and can explain every part."

---

## Requirements

I developed and tested this project on:
- Windows 11 (PowerShell)
- Node.js: `v26.13.0` (also works on Node >= 20)
- npm: `11.20.0`
- Git: `2.56.0`

All commands work across Windows, macOS, and Linux.

---

## Quick Start

### 1. Setup
```bash
npm ci
npx playwright install
```

### 2. Run the Application
```bash
npm start
```
Open `http://localhost:8080` in your browser.

### 3. Run the Tests

Run the default test suite in Chromium:
```bash
npm test
```

Run tests across all three browsers (Chromium, Firefox, WebKit):
```bash
npm run test:all-browsers
```

Run the stability suite (10 runs per test to catch flakiness):
```bash
npm run test:stability
```

Generate visual screenshots:
```bash
npm run screenshots
```

Open the HTML test report:
```bash
npm run report
```

---

## File Layout

```
mini-checkout/
├── app/
│   ├── index.html           # Single-page checkout markup
│   ├── styles.css           # Utilitarian styles, responsive layout
│   └── js/
│       ├── money.js         # Exact integer paise formatter
│       ├── cart.js          # Pure cart logic, clamping, no DOM
│       └── main.js          # DOM wiring, validation, state locking
├── tests/
│   ├── checkout.spec.js     # Playwright automated test suite (10 tests)
│   └── pages/
│       └── checkout-page.js # Page Object Model with web-first locators
├── scripts/
│   └── capture-screenshots.js # Automated screenshot evidence generator
├── docs/
│   ├── TEST_PLAN.md         # Scope, risk ranking, and test mappings
│   ├── TEST_RESULTS.md      # Test run records, stability, and sensitivity
│   ├── MANUAL_TESTS.md      # Manual test templates for manual runs
│   ├── DEFECTS.md           # Defect logs (DEF-01 and DEF-02)
│   └── evidence/            # Test execution logs and UI screenshots
├── playwright.config.js     # Test runner and web server configuration
├── package.json             # Pinned scripts and exact dependencies
├── .nvmrc                   # Pinned Node major (26)
└── .gitignore               # Ignored folders and artifacts
```

---

## Technical Decisions

- **Integer Paise Arithmetic**: I stored and calculated all prices in integer paise (`24990` and `119995`). This avoids floating point rounding bugs.
- **Pure Domain Functions**: All calculations, input clamping, and cart operations live in `app/js/cart.js` and `app/js/money.js` without any DOM dependencies.
- **Double Submission Guard**: I added a synchronous state flag (`isSubmitting` / `isOrderPlaced`) inside the submit handler and disabled the button once submitted. This stops rapid double-clicks and Enter-key double fires.
- **XSS Prevention**: Customer names are inserted into the receipt using `textContent` instead of `innerHTML`.
- **Web-First Assertions**: I used Playwright locator methods like `getByRole`, `getByLabel`, and `getByText` so tests interact with the page the way a customer does.
- **Responsive Stacking**: At 600px and below, I stacked cart rows as cards using pure CSS. Above 900px, I gave the order column sufficient width to prevent horizontal scrollbars on desktop.

---

## Assumptions

1. The store sells two synthetic items with fixed prices.
2. Quantities are limited to between 1 and 20 per line item.
3. Currency is in Indian Rupees with 3-digit comma grouping under ₹1,00,000.
4. Client-side state does not need to persist across page reloads.

---

## Known Gaps

1. Reloading the browser clears the cart since state is stored in memory.
2. Orders are not saved to any backend database.
3. No dedicated print stylesheet for printing paper receipts.

---

## What Was Not Tested

1. No screen reader testing with assistive software like NVDA or JAWS.
2. No automated axe scan for WCAG rule audits.
3. No real mobile devices (tested with Playwright viewport emulation).
4. No payment gateway integration or banking redirects.
5. No network latency or offline caching.
