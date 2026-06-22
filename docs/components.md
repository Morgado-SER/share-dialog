# Component Library

All components follow Vue 3 SFC conventions with Composition API.

---

## ShareDialog

**File:** [`src/components/ShareDialog.vue`](../src/components/ShareDialog.vue)  
**Purpose:** Modal dialog for sharing an item (task, document, e-file) with people, groups, units, or roles.

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `itemName` | `String` | `'[name of task, doc, e-file]'` | No | Display name of the item being shared |
| `recipients` | `Array` | `[]` | No | Current list of added recipients |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `close` | — | User clicked the × button |
| `cancel` | — | User clicked Cancel |
| `done` | — | User clicked Done |
| `search` | `String` | Emitted on every input change with the current query |

### Slots

None.

### States

| State | Trigger | Visual |
|-------|---------|--------|
| **Empty** | `recipients.length === 0` | User icon + "No recipients added yet" message |
| **Populated** | `recipients.length > 0` | Recipient rows (not yet implemented) |

### Accessibility

- `role="dialog"` + `aria-modal="true"` on root
- `aria-labelledby` points to the `<h2>` title
- Close button has `aria-label="Close dialog"`
- Recipient list area has `aria-live="polite"` for dynamic updates
- All interactive elements reachable via keyboard
- Focus management: caller is responsible for trapping focus and returning it on close

### Dependencies

- [`IconClose.vue`](../src/components/icons/IconClose.vue)
- [`IconUser.vue`](../src/components/icons/IconUser.vue)

### Usage Example

```vue
<ShareDialog
  item-name="Q3 Report"
  :recipients="recipients"
  @close="isOpen = false"
  @cancel="isOpen = false"
  @done="handleShare"
  @search="fetchSuggestions"
/>
```

---

## IconClose

**File:** [`src/components/icons/IconClose.vue`](../src/components/icons/IconClose.vue)  
**Purpose:** 24×24 SVG × icon. Uses `currentColor` — style via parent's `color` CSS property.

---

## IconUser

**File:** [`src/components/icons/IconUser.vue`](../src/components/icons/IconUser.vue)  
**Purpose:** 22×22 SVG person silhouette. Uses `currentColor`.

---
_Last updated: 2026-06-22_
