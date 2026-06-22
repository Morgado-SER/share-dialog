# Accessibility

Target conformance: **WCAG 2.1 AA**

---

## Global Requirements

### Keyboard Navigation
- All interactive elements reachable via `Tab`
- Logical focus order matches visual order
- Focus never trapped (except intentional modals/dialogs)
- Escape key closes overlays

### Focus Management
- Visible focus indicator on all interactive elements (min 3:1 contrast ratio)
- Focus moves to modal/dialog on open; returns to trigger on close
- Skip-to-content link present

### Color & Contrast
- Text: minimum 4.5:1 contrast ratio (AA)
- Large text (18pt / 14pt bold): minimum 3:1
- UI components and state indicators: minimum 3:1
- Never use color as the only means of conveying information

### Screen Readers
- Meaningful alt text on all images
- `aria-label` or visible label on all icon-only buttons
- Live regions (`aria-live`) for dynamic content updates
- Form inputs associated with labels via `for`/`id` or `aria-labelledby`

---

## Component-Level Notes

_Accessibility notes per component will be added here as components are built._

---

## Testing Checklist

- [ ] Keyboard-only navigation tested
- [ ] VoiceOver (macOS/iOS) tested
- [ ] NVDA or JAWS (Windows) tested
- [ ] axe DevTools / Lighthouse audit run
- [ ] Color contrast checked

---
_Last updated: 2026-06-22_
