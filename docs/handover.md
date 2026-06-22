# Developer Handover Guide

This document is the primary reference for Vue.js developers picking up the prototype.

---

## What This Prototype Is

A UX prototype for the Share Dialog product. It demonstrates user flows, component behaviour, and interaction patterns. It is **not** production code.

## What Developers Need to Know

### Stack
- Vue 3 · Composition API · SFC
- Vite
- CSS custom properties (design tokens, no hardcoded values)

### Key Documents

| Document | What it covers |
|----------|---------------|
| [project-context.md](project-context.md) | Goals, constraints, stakeholders |
| [components.md](components.md) | Full component API contracts |
| [flows.md](flows.md) | User flows and screen transitions |
| [states.md](states.md) | All UI states per component |
| [api-contracts.md](api-contracts.md) | Expected backend data shapes |
| [ux-decisions.md](ux-decisions.md) | Why things are designed the way they are |
| [accessibility.md](accessibility.md) | A11y requirements |
| [edge-cases.md](edge-cases.md) | Handled and unhandled edge cases |
| [responsive-behavior.md](responsive-behavior.md) | Breakpoints and layout rules |
| [open-questions.md](open-questions.md) | Unresolved questions |

### What Is Not Implemented in the Prototype

- [ ] Real API calls (all data is mocked)
- [ ] Authentication / authorisation
- [ ] Form validation (visual only)
- [ ] Error handling beyond UI state display
- [ ] Internationalisation

### Implementation Priorities

_To be filled before handover._

---

## Risks & Gotchas

_Known implementation risks will be listed here._

---
_Last updated: 2026-06-22_
