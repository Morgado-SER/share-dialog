# Responsive Behavior

## Breakpoints

Using a mobile-first approach.

| Token | Width | Target devices |
|-------|-------|----------------|
| `--bp-sm` | 640px | Large phones |
| `--bp-md` | 768px | Tablets portrait |
| `--bp-lg` | 1024px | Tablets landscape / small laptops |
| `--bp-xl` | 1280px | Desktops |
| `--bp-2xl` | 1536px | Large desktops |

## Layout Strategy

| Breakpoint | Layout |
|------------|--------|
| < 640px | Single column, stacked |
| 640–1023px | Two column where appropriate |
| ≥ 1024px | Full multi-column |

## Navigation Behavior

| Breakpoint | Pattern |
|------------|---------|
| < 768px | Bottom nav or hamburger menu |
| ≥ 768px | Sidebar or top nav |

---

## Component Responsive Notes

_Per-component responsive behaviour will be documented here._

### Template

```
### ComponentName
| Breakpoint | Behaviour |
|------------|-----------|
| Mobile | ... |
| Tablet | ... |
| Desktop | ... |
```

---
_Last updated: 2026-06-22_
