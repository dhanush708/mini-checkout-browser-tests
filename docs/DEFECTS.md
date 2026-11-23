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
