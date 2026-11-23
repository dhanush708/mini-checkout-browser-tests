# Mini Checkout and Browser Test Suite

A small vanilla JavaScript checkout application and Playwright test suite for a synthetic stationery store, North Ledger Stationery.

Built for the Fynd SDET Intern track (Hiring Hackathon, Round 1).

"Built with AI assistance (Antigravity with ECC rules). I reviewed it and can explain every part."

---

## Requirements

Tested on:
- Windows 11 (PowerShell)
- Node.js: `v26.13.0` (also compatible with Node >= 20)
- npm: `11.20.0`
- Git: `2.56.0`

Commands work on Windows, macOS, and Linux.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
npx playwright install
```

### 2. Run the Web Application
```bash
npm start
```
Open `http://localhost:8080` in your web browser.

### 3. Run the Automated Tests

Run the default test suite (Chromium):
```bash
npm test
```

Run tests across all three browsers (Chromium, Firefox, WebKit):
```bash
npm run test:all-browsers
```

Run the stability suite (10 iterations per test):
```bash
npm run test:stability
```

View the HTML test report:
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
│   ├── checkout.spec.js     # Playwright test suite
│   └── pages/
│       └── checkout-page.js # Page Object Model with web-first locators
├── docs/
│   ├── TEST_PLAN.md         # Scope, risks, and test case mapping
│   ├── TEST_RESULTS.md      # Execution records, stability, and mutations
│   ├── MANUAL_TESTS.md      # Manual test templates for candidate execution
│   ├── DEFECTS.md           # Defect DEF-01 record and regression resolution
│   └── evidence/            # Test run logs and UI screenshots
├── playwright.config.js     # Server startup and multi-browser configuration
├── package.json             # Pinned scripts and exact dependencies
├── .nvmrc                   # Pinned Node major (26)
└── .gitignore               # Ignored dependencies and reports
```

---

## Architecture and Design Decisions

- **Exact Integer Arithmetic**: Prices are stored and calculated in integer paise (`24990` and `119995`). Float arithmetic is completely avoided.
- **Pure Domain Logic**: All calculations, clamping, and item updates live in `app/js/cart.js` and `app/js/money.js` without any DOM dependencies.
- **Double Submission Prevention**: Handled at the application logic layer with a synchronous state flag (`isSubmitting` / `isOrderPlaced`), reinforced by button disabling.
- **XSS Prevention**: Customer names are reflected in order receipts strictly via `textContent`, preventing script injection.
- **Web-First Assertions**: Playwright tests rely on user-facing roles and text locators (`getByRole`, `getByLabel`, `getByText`) with minimal `data-testid` usage.

---

## Assumptions

1. The store sells only two synthetic items with fixed catalogue prices.
2. Quantities are capped between 1 and 20 units per line item.
3. The store operates within Indian Rupee currency (three-digit comma grouping holds under ₹1,00,000).
4. No external payment processing, shipping logic, or persistence across browser refreshes is required.

---

## Known Gaps

1. Browser refresh resets the cart because client-side state is held in memory.
2. Orders are not stored in any persistent backend or database.
3. Printing receipt styles are not specifically formatted for paper output.

---

## What Was Not Tested

1. Payment gateway integration, card validation, and banking callbacks (out of scope).
2. Screen reader audio output across screen readers like NVDA or VoiceOver (structural HTML and ARIA labels were validated).
3. Network latency or offline connectivity handling.
4. Legacy browsers (Internet Explorer, legacy Edge).
