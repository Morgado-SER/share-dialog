# UX Decisions

---

### [DEC-001] Dialog width fixed at 440px
- **Date:** 2026-06-22
- **Status:** Accepted
- **Context:** Figma design specifies a fixed 440px wide dialog.
- **Decision:** Use `width: 440px` on the dialog shell.
- **Rationale:** Keeps the reading line comfortable for a form-like interface. Wide enough for name/email rows.
- **Alternatives Considered:** Fluid/responsive width.
- **Developer Notes:** On viewports < 480px the dialog will need to go full-width. See `responsive-behavior.md`.

---

### [DEC-002] Empty state instead of hidden list area
- **Date:** 2026-06-22
- **Status:** Accepted
- **Context:** Before any recipients are added the list area is empty.
- **Decision:** Show an explicit empty state (icon + copy) rather than just blank space.
- **Rationale:** Guides the user on what to do next; reduces confusion. Figma spec confirms this pattern.
- **Alternatives Considered:** Hidden list area (only shows once populated).
- **Developer Notes:** Toggle on `recipients.length === 0`.

---

### [DEC-003] Inline SVG icons over image assets
- **Date:** 2026-06-22
- **Status:** Accepted
- **Context:** Figma exports vector icons as PNG assets with short-lived URLs.
- **Decision:** Recreate close (×) and user icons as Vue SFC inline SVGs using `currentColor`.
- **Rationale:** Long-term maintainability; no asset expiry; scales perfectly; inherits color from CSS.
- **Alternatives Considered:** Download PNGs and commit to `/src/assets`; use Figma asset URLs directly.
- **Developer Notes:** All icons use `currentColor` — control color via parent's CSS `color` property.

---

### [DEC-004] Figtree font via Google Fonts
- **Date:** 2026-06-22
- **Status:** Accepted
- **Context:** WebCube design system uses Figtree as its typeface.
- **Decision:** Load Figtree via Google Fonts link in `index.html`.
- **Rationale:** Fastest path for prototype. Weights loaded: 400, 500, 600, 700.
- **Alternatives Considered:** Self-host font files.
- **Developer Notes:** For production, self-hosting is preferred (avoids Google Fonts privacy concerns and improves reliability).

---
_Last updated: 2026-06-22_
