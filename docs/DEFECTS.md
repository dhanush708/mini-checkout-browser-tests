# Defect log

## DEF-01: Horizontal overflow on narrow viewports (375px) when cart contains items

- **ID**: DEF-01
- **Severity**: Medium (Responsive layout violation)
- **Status**: Resolved
- **Evidence**: [docs/evidence/filled-cart-375px.png](evidence/filled-cart-375px.png)
- **Detected by**: I found this during an exploratory check of the 375px mobile viewport.
- **Resolved by**: Wrapped the table in a container, set `min-width: 0` on grid children, and added compact padding. Verified via regression test TC-09 in [tests/checkout.spec.js](../tests/checkout.spec.js).

### Steps to reproduce
1. Set viewport to 375px x 812px (standard mobile device viewport).
2. Navigate to `http://127.0.0.1:8080/`.
3. Click "Add to cart" on "A5 Dotted Notebook".
4. Measure `document.documentElement.scrollWidth` against `window.innerWidth`.

### Expected result
The page remains within the 375px viewport width (`scrollWidth <= innerWidth`) without horizontal scrollbars.

### Actual result
`scrollWidth` measures 446.58px, exceeding the 375px viewport by 71.58px. The unconstrained 5-column cart `<table>` expands beyond the container width, pushing parent grid cells and creating horizontal scroll on mobile screens.

### Resolution
1. Wrap `#cart-table` in an `overflow-x: auto` container or compact table cell paddings and button widths on narrow viewports (`@media (max-width: 480px)`).
2. Set `min-width: 0` on grid items to prevent table content from blowing out the grid container width.
3. Added an automated regression test TC-09 in [tests/checkout.spec.js](../tests/checkout.spec.js) asserting `scrollWidth <= innerWidth` at 375px.

---

## DEF-02: Cart table horizontal scrolling and clipped controls on desktop viewports

- **ID**: DEF-02
- **Severity**: High (Desktop usability and responsive defect)
- **Status**: Resolved
- **Evidence**:
  - [docs/evidence/def-02-before-375px.png](evidence/def-02-before-375px.png)
  - [docs/evidence/def-02-before-1024px.png](evidence/def-02-before-1024px.png)
  - [docs/evidence/def-02-before-1280px.png](evidence/def-02-before-1280px.png)
  - [docs/evidence/def-02-before-1600px.png](evidence/def-02-before-1600px.png)
  - [docs/evidence/filled-cart-1280px.png](evidence/filled-cart-1280px.png)
- **Detected by**: I found this by hand in Chrome while testing desktop screen widths. I then confirmed and measured it with a Playwright probe script.
- **Cause**: The initial DEF-01 fix introduced an `overflow-x: auto` wrapper on the cart table within a 960px container. In the two-column layout, the order column only had 384px width, which was too narrow for the 434px cart table. This caused horizontal scrolling on desktop, clipped the Remove button, and wrapped item names onto multiple lines.

### Steps to reproduce
1. Open the application at desktop width (1024px, 1280px, or 1600px).
2. Click "Add to cart" for "A5 Dotted Notebook".
3. Click "Add to cart" for "Brass Fountain Pen".
4. Observe the order panel and cart table layout.

### Expected result
- The entire cart table is visible without any horizontal scrollbar across all desktop widths.
- The "Remove" button is fully visible inside its container without scrolling.
- Product titles such as "Brass Fountain Pen" do not wrap onto three lines.

### Actual result
- Measured at 1024px, 1280px, and 1600px:
  - Container width (`wrapperClientWidth`): 384px.
  - Table scroll width (`wrapperScrollWidth`): 434px.
  - Horizontal scrollbar present: `hasHorizontalScroll = true`.
  - "Remove" button right edge: 1145px vs wrapper right edge 1103px (42px clipped).
  - Title cell height: 84px due to heavy word wrapping.
- Measured at 375px:
  - Container width: 333px, table scroll width: 373px.
  - "Remove" button right edge: 389.88px vs 375px window width (button clipped outside viewport).

### Resolution
1. Widened the desktop page wrapper to 1120px max-width.
2. Adjusted the two-column grid breakpoint to 900px with a 1fr 1.25fr ratio, giving the order column over 550px of space.
3. At 600px and below, stacked cart rows as cards using pure CSS without horizontal table scrolling.
4. Added automated regression test TC-10 in [tests/checkout.spec.js](../tests/checkout.spec.js) asserting zero overflow and full Remove button visibility at 1280px and 375px.
