/**
 * Accessibility QA findings for the Share dialog — WCAG 2.2, Level AA target.
 *
 * This is the data behind the prototype's Accessibility tab. The narrative
 * version (method, evidence, caveats) lives in /Accessibility.md — keep the two
 * in step when findings are added or resolved.
 */

export const auditMeta = {
  scope: 'Share dialog',
  standard: 'WCAG 2.2 — Level AA target',
  date: '10 September 2026',
  reference: 'https://www.w3.org/WAI/WCAG22/quickref/',
}

/** Criteria the dialog already meets — worth protecting in future changes. */
export const passing = [
  { sc: '1.4.3 Contrast (text)',  note: 'All AA — title 13.9:1, sub-text 7.46:1, names 16.1:1, buttons 13.9:1' },
  { sc: '2.4.7 Focus Visible',    note: 'Global :focus-visible — 2px #1a3572 outline at 11.69:1' },
  { sc: '2.5.8 Target Size',      note: 'Close 24×24, chips 105×30, buttons 102×40 — all ≥ 24×24' },
  { sc: '1.4.10 Reflow',          note: 'No horizontal scroll at 320px; content reachable at 320×256' },
  { sc: '3.3.2 Labels',           note: 'Real <label for>; placeholder is not used as the label' },
  { sc: '3.1.1 Language',         note: '<html lang="en">' },
]

/**
 * severity: 'high' | 'medium' | 'low'
 * measured: true when the evidence came from a live measurement rather than
 *           being inferred from the markup (see the caveats in Accessibility.md)
 */
export const findings = [
  // ── High ────────────────────────────────────────────────────────────────
  {
    id: 'a11y-1',
    severity: 'high',
    title: 'No focus trap, despite aria-modal="true"',
    sc: 'SC 2.4.3, 4.1.2',
    measured: true,
    evidence: '8 focusable elements outside the dialog remain tab-reachable (nav tabs, source links). The dialog claims a modality it does not enforce.',
    action: 'Implement a focus trap, or drop aria-modal until it is real.',
  },
  {
    id: 'a11y-2',
    severity: 'high',
    title: 'No focus management on open/close',
    sc: 'SC 2.4.3',
    measured: true,
    evidence: 'Focus is never moved into the dialog on open, nor returned to the trigger on close.',
    action: 'On open, focus the dialog or its first control; store and restore the invoking element on close.',
  },
  {
    id: 'a11y-3',
    severity: 'high',
    title: 'Escape does not close the dialog',
    sc: 'ARIA APG — modal dialog',
    measured: true,
    evidence: '@keydown.esc only closes the results dropdown.',
    action: 'Add a dialog-level Escape handler.',
  },
  {
    id: 'a11y-4',
    severity: 'high',
    title: 'Combobox is not keyboard-navigable',
    sc: 'SC 2.1.1 (partial), 4.1.2',
    measured: true,
    evidence: 'Arrow Down does nothing — focus stays in the input. No aria-controls, no aria-activedescendant; the listbox has no id and no accessible name. Options are Tab-reachable buttons, so it is operable but not the expected pattern.',
    action: 'Implement the APG combobox pattern (↑/↓ move the active option, Enter selects, Esc closes) and wire aria-controls + aria-activedescendant.',
  },
  {
    id: 'a11y-5',
    severity: 'high',
    title: 'Focus obscured by the open dropdown',
    sc: 'SC 2.4.11 (new in 2.2)',
    measured: true,
    evidence: 'With the dropdown open, all 3 suggestion chips are fully covered (dropdown spans y 369–649) yet stay in the tab order. Tabbing past the last option lands focus on a hidden control.',
    action: 'Make covered chips inert (inert / tabindex="-1") while the dropdown is open, or close the dropdown when focus leaves it.',
  },

  // ── Medium ──────────────────────────────────────────────────────────────
  {
    id: 'a11y-6',
    severity: 'medium',
    title: 'Search results are probably never announced',
    sc: 'SC 4.1.3 Status Messages',
    measured: false,
    evidence: 'aria-live="polite" sits on the dropdown itself, which is v-if mounted together with its content. Live regions must already exist in the DOM for changes to be announced.',
    action: 'Move the live region to a permanently rendered visually-hidden element announcing e.g. "7 results available".',
  },
  {
    id: 'a11y-7',
    severity: 'medium',
    title: 'Shared-with list re-announces wholesale',
    sc: 'SC 4.1.3',
    measured: false,
    evidence: 'aria-live="polite" aria-atomic="true" on the whole list re-reads every recipient on each add or remove.',
    action: 'Drop aria-atomic; announce only the change.',
  },
  {
    id: 'a11y-8',
    severity: 'medium',
    title: 'No confirmation when a recipient is added or removed',
    sc: 'SC 4.1.3',
    measured: false,
    evidence: 'Adding or removing a recipient produces no announcement.',
    action: 'Announce "<name> added" / "<name> removed" via the status region.',
  },
  {
    id: 'a11y-9',
    severity: 'medium',
    title: 'Input border fails non-text contrast',
    sc: 'SC 1.4.11',
    measured: true,
    evidence: '#dddddd = 1.36:1 against white (needs 3:1).',
    action: 'Darken the --color-neutral-200 token to ≈ #949494 or darker. Same fix as #10 and #11.',
  },
  {
    id: 'a11y-10',
    severity: 'medium',
    title: 'Suggestion chip border fails non-text contrast',
    sc: 'SC 1.4.11',
    measured: true,
    evidence: '#dddddd = 1.36:1 against white (needs 3:1).',
    action: 'Covered by the same token change as #9.',
  },
  {
    id: 'a11y-11',
    severity: 'medium',
    title: 'Dropdown border fails non-text contrast',
    sc: 'SC 1.4.11',
    measured: true,
    evidence: '#dddddd = 1.36:1 against white (needs 3:1).',
    action: 'Covered by the same token change as #9.',
  },
  {
    id: 'a11y-12',
    severity: 'medium',
    title: 'Placeholder text fails contrast',
    sc: 'SC 1.4.3',
    measured: true,
    evidence: '#939393 = 3.07:1 (text needs 4.5:1).',
    action: 'Darken to #757575 (4.6:1) or darker.',
  },

  // ── Low ─────────────────────────────────────────────────────────────────
  {
    id: 'a11y-13',
    severity: 'low',
    title: '"No results for…" fails contrast',
    sc: 'SC 1.4.3',
    measured: true,
    evidence: '--color-neutral-400 (#939393) = 3.07:1.',
    action: 'Darken the empty-state text.',
  },
  {
    id: 'a11y-14',
    severity: 'low',
    title: 'Avatar alt duplicates the visible name',
    sc: 'SC 1.1.1',
    measured: false,
    evidence: 'alt="{name}" sits directly beside the same name in text, so screen readers announce it twice.',
    action: 'Use alt="" — the avatar is decorative.',
  },
  {
    id: 'a11y-15',
    severity: 'low',
    title: '"Already added" rows use disabled',
    sc: 'SC 4.1.2',
    measured: true,
    evidence: 'disabled removes them from the tab order, so keyboard users never land on them.',
    action: 'Prefer aria-disabled="true" so the state is announced while the row stays reachable.',
  },
  {
    id: 'a11y-16',
    severity: 'low',
    title: 'Trash tooltip is hover-only',
    sc: 'SC 1.4.13',
    measured: true,
    evidence: 'Not shown on keyboard focus, not Esc-dismissible, pointer-events: none so not hoverable. aria-label="Remove" covers screen-reader users, so this affects sighted keyboard users only.',
    action: 'Show the tooltip on focus too, make it dismissible with Escape, and allow hovering it.',
  },
  {
    id: 'a11y-17',
    severity: 'low',
    title: 'Truncated-email tooltip is hover-only',
    sc: 'SC 1.4.13',
    measured: true,
    evidence: 'Sighted keyboard users cannot reveal truncated addresses.',
    action: 'Reveal the full value on focus as well as hover.',
  },
  {
    id: 'a11y-18',
    severity: 'low',
    title: 'No <h1> on the page',
    sc: 'SC 1.3.1 / 2.4.6',
    measured: true,
    evidence: 'The dialog title is an <h2>; the page has no <h1>.',
    action: 'Largely moot once the dialog becomes a real overlay — revisit then.',
  },
]

/** Things this audit could not confirm — they still need a human. */
export const caveats = [
  'No real screen-reader testing. Findings 6–8, 14 and 15 are inferred from ARIA/DOM patterns, not observed in NVDA, JAWS or VoiceOver.',
  'SC 1.4.12 Text Spacing untested — fixed heights (.share-item 54px, inputs 40px) are a plausible clipping risk under user spacing overrides.',
  'SC 2.3.3 Animation from Interactions (AAA) — no prefers-reduced-motion handling; advisory only.',
  'Scope is the Share dialog. Rights reuses most components, so 1–15 will largely apply there too; its permissions table needs its own pass.',
]
