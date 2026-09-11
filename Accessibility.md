# Accessibility QA — Share Dialog

**Standard:** WCAG 2.2 (Level AA target)
**Date:** 10 September 2026
**Scope:** the **Share** and **Rights** dialogs, including the Rights permissions table
**Reference:** [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)

> This is a **starting point**, not a certification. It mixes measured facts with
> inferred issues — see [Caveats](#caveats--what-was-not-verified) for what still needs
> human verification.
>
> An interactive, tickable version of this list lives in the prototype's
> **Accessibility** tab: https://morgado-ser.github.io/share-dialog/

## Method

Static review of `ShareDialog.vue`, `ShareItem.vue`, `SuggestionChip.vue`, `AvatarItem.vue`
and `reset.css`, plus live testing in the browser:

- computed colour-contrast ratios on the rendered elements
- tab-order enumeration inside and outside the dialog
- keyboard probing (Arrow keys, Escape, Tab)
- target-size measurement
- reflow at 320px and at 320×256

---

## Summary

| Severity | Count | Theme |
| --- | --- | --- |
| 🔴 High | 8 | Focus management, obscured focus, ARIA combobox, unlabelled table controls |
| 🟠 Medium | 11 | Status announcements, contrast, table semantics |
| 🟡 Low | 6 | Redundant alt text, tooltips, headings |

**10 of 25 resolved** — all ten engineering findings from the first pass, applied to
both dialogs. Findings 19–25 come from the second pass over the Rights permissions table.

### Who owns it

| Category | Count | Meaning |
| --- | --- | --- |
| **Design** | 6 | Needs a design decision; changes what users see |
| **Design + Eng** | 4 | Needs a design decision *and* code |
| **Engineering** | 15 | Code only; invisible to sighted users — 10 already fixed |

> **Layout impact: none.** No finding changes layout or geometry. All 5 Design items are
> colour/token changes (4 of them the *same* `--color-neutral-200` token), and the 3
> Design + Eng items are overlay behaviour. Nothing reflows or resizes.
>
> The one potential layout risk — fixed heights vs. **SC 1.4.12 Text Spacing** — is
> unverified and listed under [Caveats](#caveats--what-was-not-verified).

---

## ✅ What already passes

Worth protecting in future changes:

| Success criterion | Result |
| --- | --- |
| **1.4.3 Contrast (text)** | All AA: title **13.9:1**, subtitle & sub-text **7.46:1**, names **16.1:1**, buttons **13.9:1** |
| **2.4.7 Focus Visible** | Global `:focus-visible` — 2px `#1a3572` outline at **11.69:1**, with `:focus:not(:focus-visible)` suppressing mouse rings. Likely also meets AAA **2.4.13** |
| **2.5.8 Target Size (2.2)** | Close 24×24, chips 105×30, buttons 102×40 — all ≥ 24×24 |
| **1.4.10 Reflow** | No horizontal scroll at 320px; chips wrap; all content reachable at 320×256 |
| **3.3.2 / 1.3.1** | Real `<label for>` (placeholder is not the label), semantic `<ul>`, `<h2>` title, `aria-labelledby` on the dialog |
| **3.1.1 Language** | `<html lang="en">` |

---

## 🔴 High priority

### 1. No focus trap, despite `aria-modal="true"` — SC 2.4.3, 4.1.2
`Engineering`

**Measured:** 8 focusable elements outside the dialog remain tab-reachable (nav tabs, source links).
The dialog claims a modality it does not enforce, which actively misleads assistive tech.
**Action:** implement a focus trap, or drop `aria-modal` until it is real.

### 2. No focus management on open/close — SC 2.4.3
`Engineering`

Focus is never moved into the dialog on open, nor returned to the trigger on close.
**Action:** on open, focus the dialog or its first control; store and restore the invoking element on close.

### 3. Escape does not close the dialog
`Engineering`

`@keydown.esc` only closes the results dropdown.
**Action:** add a dialog-level Escape handler (ARIA APG requirement for modals).

### 4. Combobox is not keyboard-navigable — SC 2.1.1 (partial), 4.1.2
`Design + Eng`

**Measured:** Arrow Down does nothing; focus stays in the input. The ARIA is incomplete —
no `aria-controls`, no `aria-activedescendant`, and the listbox has no `id` and no accessible name.
*Mitigating:* options are `<button>`s, so they are Tab-reachable — operable, but not the expected pattern.
**Action:** implement the APG combobox pattern (↑/↓ move the active option, Enter selects, Esc closes)
and wire up `aria-controls` + `aria-activedescendant`.

### 5. Focus obscured by the dropdown — SC 2.4.11 Focus Not Obscured (Minimum), AA — **new in WCAG 2.2**
`Engineering`

**Measured:** with the dropdown open, all 3 suggestion chips are fully covered
(dropdown spans y 369–649) yet remain in the tab order. Tabbing past the last option
lands focus on a completely hidden control.
**Action:** while the dropdown is open, make the covered chips inert (`inert` or `tabindex="-1"`),
or close the dropdown when focus leaves it.

---

## 🟠 Medium priority

### 6. Results are probably never announced — SC 4.1.3 Status Messages
`Engineering`

`aria-live="polite"` sits on the dropdown element itself, which is `v-if`-mounted **together with**
its content. Live regions must already exist in the DOM for changes to be announced.
**Action:** move the live region to a permanently rendered visually-hidden element,
announcing e.g. "7 results available".

### 7. Shared-with list re-announces wholesale — SC 4.1.3
`Engineering`

`aria-live="polite" aria-atomic="true"` on the whole list means every add/remove re-reads the entire list.
**Action:** drop `aria-atomic`; announce only the delta.

### 8. No confirmation when a recipient is added or removed — SC 4.1.3
`Engineering`

**Action:** announce "Joanna Lee added" / "Joanna Lee removed" via the status region.

### 9. Input border fails non-text contrast — SC 1.4.11
`Design`

`#dddddd` = **1.36:1** (needs 3:1).

### 10. Suggestion chip border fails non-text contrast — SC 1.4.11
`Design`

`#dddddd` = **1.36:1** (needs 3:1).

### 11. Dropdown border fails non-text contrast — SC 1.4.11
`Design`

`#dddddd` = **1.36:1** (needs 3:1).

> **9–11 are one decision.** These are the boundaries that define each control, and they all
> come from the same token (`--color-neutral-200`). Darkening to ≈ `#949494` or darker fixes
> all three — but it affects the whole design system, so it belongs with the design team
> rather than as a local patch.

### 12. Placeholder text fails contrast — SC 1.4.3
`Design`

`#939393` = **3.07:1** (text needs 4.5:1).
**Action:** darken to `#757575` (4.6:1) or darker.

---

## 🟡 Low priority

### 13. "No results for…" fails contrast — SC 1.4.3
`Design`

Uses `--color-neutral-400` (`#939393`) = **3.07:1**. Darken it.

### 14. Avatar `alt` duplicates the visible name — SC 1.1.1
`Engineering`

`alt="{name}"` sits directly beside the same name in text, so screen readers announce it twice.
**Action:** use `alt=""` (decorative).

### 15. "Already added" rows are `disabled` — SC 4.1.2
`Engineering`

`disabled` removes them from the tab order, so keyboard users never land on them.
**Action:** prefer `aria-disabled="true"` so the state is announced while the row stays reachable.

### 16. Trash tooltip is hover-only — SC 1.4.13
`Design + Eng`

Not shown on keyboard focus, not Esc-dismissible, and `pointer-events: none` so it is not hoverable.
*Mitigating:* `aria-label="Remove"` covers screen-reader users, so this affects sighted keyboard users only.

### 17. Truncated-email tooltip is hover-only — SC 1.4.13
`Design + Eng`

Sighted keyboard users cannot reveal truncated addresses.

### 18. No `<h1>` on the page — SC 1.3.1 / 2.4.6
`Engineering`

The dialog title is an `<h2>`. Minor, and largely moot once the dialog becomes a real overlay.

---

## Rights permissions table (second pass)

Audited separately, since it was out of scope first time round. All findings measured.

### 19. Checkboxes have no accessible name — SC 4.1.2, 1.3.1
`Engineering` · 🔴 High

All **48** Allow/Deny/Delegate controls are `<button>`s with no `aria-label` and no text, so a
screen reader announces each only as "button" — with no idea which permission or column it belongs to.
**Action:** name each one, e.g. `aria-label="Allow — Documents - Create"`.

### 20. Checkboxes expose no state — SC 4.1.2
`Engineering` · 🔴 High

No role and no `aria-checked`/`aria-pressed`, so on/off/partial is invisible to assistive tech.
**Action:** `role="checkbox"` with `aria-checked="true" | "false" | "mixed"` — `mixed` maps exactly onto the partial state.

### 21. Partial state is conveyed by colour alone — SC 1.4.1
`Design + Eng` · 🔴 High

Checked (all) and partial (some) render an **identical check icon**, differing only in fill —
`#052474` vs `#d9d9d9`. Verified the two SVGs are byte-identical.
**Action:** give the partial state its own shape (a dash, as native indeterminate checkboxes use) alongside the colour.

### 22. Partial checkbox fails non-text contrast — SC 1.4.11
`Design` · 🟠 Medium

`#d9d9d9` on white = **1.41:1** (needs 3:1) — close to invisible against the white cell.

### 23. No table semantics — SC 1.3.1
`Engineering` · 🟠 Medium

Built from plain `<div>`s with no `role="table"/"row"/"columnheader"/"cell"`, so table navigation
does not work and cells are not associated with their headers.

### 24. Sort state is not exposed — SC 4.1.2
`Engineering` · 🟠 Medium

All 4 sortable headers lack `aria-sort`; the current column and direction are conveyed only by the arrow icon.

### 25. Panel title is not a heading — SC 1.3.1
`Engineering` · 🟡 Low

"Permissions for …" is a `<p>`, so it cannot be reached by heading navigation.

---

## Suggested sequencing

1. **Focus & keyboard** (1–5) — biggest real-world impact, and #5 is a hard WCAG 2.2 AA failure.
2. **Status announcements** (6–8) — the flow is currently silent for screen-reader users.
3. **Contrast tokens** (9–13) — one design-system decision fixes most of it across all dialogs.
4. **Polish** (14–18).

---

## Caveats — what was *not* verified

- **No real screen-reader testing.** Findings 6–8, 14 and 15 are inferred from ARIA/DOM patterns,
  not observed in NVDA, JAWS or VoiceOver. Confirm manually before treating them as settled.
- **SC 1.4.12 Text Spacing untested.** The fixed heights (`.share-item` 54px, inputs 40px) are a
  plausible clipping risk under user spacing overrides — needs the standard bookmarklet check.
- **SC 2.3.3 Animation from Interactions (AAA)** — no `prefers-reduced-motion` handling; advisory only.
- **Both dialogs are now covered.** The ten engineering fixes were applied to Rights as well,
  and the permissions table has had its own pass (findings 19–25). The remaining Share findings
  are shared design tokens, so they cover both dialogs at once.
