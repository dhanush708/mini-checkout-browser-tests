# Defect Log

## DEF-01: Horizontal overflow on narrow viewports (375px) when cart contains items

- **ID**: DEF-01
- **Severity**: Medium (Responsive layout violation)
- **Status**: Resolved
- **Evidence**: `docs/evidence/filled-cart-375px.png`
- **Detected By**: Scripted probe (`run-probes.js` 375px responsive check)
- **Resolved By**: Wrapped table in `.table-responsive` container, set `min-width: 0` on grid children, and added `@media (max-width: 480px)` cell padding adjustments. Verified via regression test `prevents horizontal viewport overflow at 375px mobile breakpoint (regression DEF-01)`.

### Steps to Reproduce
1. Set viewport to 375px x 812px (standard mobile device viewport).
2. Navigate to `http://127.0.0.1:8080/`.
3. Click "Add to cart" on "A5 Dotted Notebook".
4. Measure `document.documentElement.scrollWidth` against `window.innerWidth`.

### Expected Result
The page remains within the 375px viewport width (`scrollWidth <= innerWidth`) without horizontal scrollbars, complying with REQ-12.

### Actual Result
`scrollWidth` measures 446.58px, exceeding the 375px viewport by 71.58px. The unconstrained 5-column cart `<table>` expands beyond the container width, pushing parent grid cells and creating horizontal scroll on mobile screens.

### Remediation
1. Wrap `#cart-table` in an `overflow-x: auto` container (`.cart-table-wrapper`) or compact table cell paddings and button widths on narrow viewports (`@media (max-width: 480px)`).
2. Set `min-width: 0` on grid items to prevent table content from blowing out the grid container width.
3. Add an automated regression test in `tests/checkout.spec.js` asserting `scrollWidth <= innerWidth` at 375px.

---

## DEF-02: Cart table horizontal scrolling and clipped controls on desktop viewports

- **ID**: DEF-02
- **Severity**: High (Desktop usability and responsive defect)
- **Status**: Identified
- **Evidence**:
  - `docs/evidence/def-02-before-375px.png`
  - `docs/evidence/def-02-before-1024px.png`
  - `docs/evidence/def-02-before-1280px.png`
  - `docs/evidence/def-02-before-1600px.png`
- **Detected By**: Found by hand in Chrome by Dhanush. Confirmed and measured via automated Playwright probe.
- **Cause**: The earlier DEF-01 fix introduced an `overflow-x: auto` container (`.table-responsive`) within a fixed 960px container split into a 1.1fr / 0.9fr grid. The right column had only 384px client width, which is too narrow for a 5-column table (434px minimum width). This caused a horizontal scrollbar on desktop, pushed the Remove button 42px off the right edge, and wrapped product titles into multiple lines.

### Steps to Reproduce
1. Open the application at desktop width (1024px, 1280px, or 1600px).
2. Click "Add to cart" for "A5 Dotted Notebook".
3. Click "Add to cart" for "Brass Fountain Pen".
4. Observe the order panel and cart table layout.

### Expected Result
- The entire cart table is visible without any horizontal scrollbar across all desktop widths.
- The "Remove" button is fully visible inside its container without scrolling.
- Product titles such as "Brass Fountain Pen" do not wrap onto three lines.

### Actual Result
- Measured at 1024px, 1280px, and 1600px:
  - Container width (`wrapperClientWidth`): 384px.
  - Table scroll width (`wrapperScrollWidth`): 434px.
  - Horizontal scrollbar present: `hasHorizontalScroll = true`.
  - "Remove" button right edge: 1145px vs wrapper right edge 1103px (42px clipped).
  - Title cell height: 84px due to heavy word wrapping.
- Measured at 375px:
  - Container width: 333px, table scroll width: 373px.
  - "Remove" button right edge: 389.88px vs 375px window width (button clipped outside viewport).

### Remediation Plan
1. Widen the desktop page wrapper to ~1120px max-width to provide comfortable breathing room.
2. Adjust the two-column grid breakpoint to ~900px, allocating sufficient space for the cart (e.g. 1fr 1.2fr or minimum ~560px for the order column).
3. At 600px and below, stack each cart row using CSS (display: block/flex cards) instead of horizontal table scrolling.
4. Eliminate horizontal scrolling from 320px to 1920px width.
5. Add regression test TC-10 covering 1280px and 375px viewports.
