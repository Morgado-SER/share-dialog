# Edge Cases

---

## ShareDialog

### Long item names
- **Scenario:** `itemName` prop contains a very long string (e.g. 80+ characters)
- **Expected behaviour:** Title truncates with `text-overflow: ellipsis` on one line
- **Current behaviour:** Text wraps — no truncation applied yet
- **Priority:** Medium
- **Status:** Open

### Special characters in item name
- **Scenario:** Item name contains `<`, `>`, `"`, `&`, or emoji
- **Expected behaviour:** Rendered safely — Vue's template binding escapes HTML automatically
- **Current behaviour:** Handled correctly by Vue's default escaping
- **Priority:** Low
- **Status:** Handled

### Empty itemName prop
- **Scenario:** `itemName` is an empty string or not passed
- **Expected behaviour:** Fall back to `[name of task, doc, e-file]` default
- **Current behaviour:** Default prop value handles this correctly
- **Priority:** Low
- **Status:** Handled

### Clicking Done with no recipients
- **Scenario:** User opens dialog, adds nobody, clicks Done
- **Expected behaviour:** No API call; dialog closes silently (or with a confirmation)
- **Current behaviour:** `done` event is emitted — parent decides behaviour
- **Priority:** Medium
- **Status:** Open — needs product decision

### Viewport narrower than 440px
- **Scenario:** Dialog displayed on mobile (< 480px viewport)
- **Expected behaviour:** Dialog fills full width, scrolls if content overflows
- **Current behaviour:** Dialog clips at 440px
- **Priority:** High
- **Status:** Open — responsive behaviour not yet implemented

### Keyboard: Escape to close
- **Scenario:** User presses Escape while dialog is open
- **Expected behaviour:** Dialog closes
- **Current behaviour:** Not implemented — needs `keydown` listener on the overlay/document
- **Priority:** High (accessibility requirement)
- **Status:** Open

### Focus trap inside dialog
- **Scenario:** User presses Tab past the last focusable element
- **Expected behaviour:** Focus cycles back to the first focusable element (close button)
- **Current behaviour:** Not implemented
- **Priority:** High (accessibility requirement)
- **Status:** Open

---
_Last updated: 2026-06-22_
