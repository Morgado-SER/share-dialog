# UI States

Catalogue of all UI states across the application.

---

## ShareDialog

### Empty state ✅ Implemented
- **Trigger:** `recipients` prop is an empty array
- **Visual:** Circular gray icon + "No recipients added yet" + descriptive body text
- **Actions available:** Type in the search field
- **Transitions to:** Populated state (when first recipient is added)

### Populated state 🔲 Not yet implemented
- **Trigger:** `recipients` prop has one or more entries
- **Visual:** List of recipient rows (avatar + name + role selector + remove button)
- **Actions available:** Remove recipients, change permission level, search for more
- **Transitions to:** Empty state (if all recipients removed)

### Search active state 🔲 Not yet implemented
- **Trigger:** User types in the search field
- **Visual:** Dropdown/list of matching suggestions below the input
- **Actions available:** Select a suggestion to add as recipient
- **Transitions to:** Populated state

### Loading / search results state 🔲 Not yet implemented
- **Trigger:** API call in flight after user input (debounced)
- **Visual:** Spinner or skeleton rows in suggestion list
- **Actions available:** Wait or clear input

### No search results state 🔲 Not yet implemented
- **Trigger:** API returns empty results for the current query
- **Visual:** "No results for '[query]'" message in the dropdown
- **Actions available:** Edit search query

---

## Input field states

| State | Visual |
|-------|--------|
| Default | Border `#DDD`, placeholder text |
| Focus | Brand-colored border + soft glow ring |
| Filled | Dark text, border `#DDD` |
| Disabled | Not currently designed |

---
_Last updated: 2026-06-22_
