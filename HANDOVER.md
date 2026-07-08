# Developer Handover — Share & Rights Dialogs

This prototype is a **design reference**, not a production integration. It demonstrates
the intended UI, states, and interactions for two access-management dialogs so they can
be rebuilt / wired up in the real WebCube application.

- **Live prototype:** https://morgado-ser.github.io/share-dialog/ (auto-deploys on push to `main`)
- **Repo:** https://github.com/Morgado-SER/share-dialog
- **Stack:** Vue 3 (`<script setup>` SFCs), Vite, plain CSS with design tokens. No state manager, no router, no runtime deps beyond Vue.

> ⚠️ All search results and permissions are **mock data**. See [Integration checklist](#integration-checklist) for what needs a real backend.

---

## 1. The two dialogs

Both share the same search-and-invite core; they differ in what you can do after adding people.

### Share (`ShareDialog.vue`) — simple
Invite people to an item. Width **488px**, fixed.

- Type in the search field → results list with an **Add** button per row.
- Already-added people still appear in results, labelled **"Already added"** (no Add).
- The **"Shared with"** list shows each recipient; hovering a row reveals a **trash icon** to remove them.
- No permission controls — the intent is purely to grant access.

### Rights (`RightsDialog.vue`) — advanced
Invite people **and** manage granular permissions. Width **488px**, expands to **1048px**.

- Each recipient has a **permission dropdown**: `Read/display`, `Write/modify`, `Full access`, `Custom`.
  Picking a preset fills that recipient's permission table from a template (`Custom` opens the table to edit freely).
- **Show advanced options** (footer link) expands the dialog to reveal the **permissions table**
  (columns: Name / Allow / Deny / Delegate), with sortable columns and truncation tooltips.
  The link toggles to **Hide advanced options** to collapse.
- The link is **disabled until at least one recipient exists**; hovering it while disabled shows a tooltip
  ("Please add recipients to get access to advanced options").
- Recipients get **checkboxes** in advanced mode. Selecting **multiple** recipients shows their
  **combined** permissions and edits apply to all of them at once — see [Combine semantics](#combine-semantics).
- Deselecting everyone shows the table's **empty state** ("No recipients selected").

---

## 2. Component API

| Component | Purpose |
| --- | --- |
| `ShareDialog.vue` | Simple Share dialog |
| `RightsDialog.vue` | Advanced Rights dialog |
| `PermissionsPanel.vue` | The permissions table (used by Rights) |
| `ShareItem.vue` | One recipient / search-result row (shared by both dialogs) |
| `AvatarItem.vue` | Avatar for person / group / unit / role |
| `RadioButton.vue` | Radio control (currently unused in the dialogs; kept for the component set) |
| `icons/*` | Inline SVG icon components |

### `ShareDialog` / `RightsDialog`
```
Props:
  itemName: String   // name shown in the title

Events:
  close               // ✕ button
  cancel              // Cancel button
  done                // Done button  — hook this up to persist the share
  add(result)         // a recipient was added
  advanced-options    // (RightsDialog only) advanced mode toggled
```

### `ShareItem`
```
Props:
  type: 'Secondary' | 'Tertiary'      // Secondary = search result, Tertiary = shared-with row
  name, subText, tag, permission: String
  avatarType, avatarSrc: String
  selected:  Boolean   // advanced-mode checkbox checked (Rights)
  added:     Boolean   // already in the shared list → shows "Already added" / permission control
  advanced:  Boolean   // Rights advanced mode → show selection checkbox
  permissionControl: Boolean = true   // false → hide the permission dropdown (Share)
  deletable: Boolean = false          // true → show trash icon on row hover (Share)

Events:
  select              // checkbox / row clicked (Rights advanced)
  add                 // Add button
  update:permission   // permission dropdown changed (value is the new level)
  remove              // removed via dropdown "Remove" (Rights) or trash icon (Share)
```
`ShareItem` is deliberately generic — the two dialogs configure it via props. The permission
dropdown lists `['Read/display', 'Write/modify', 'Full access', 'Custom']`.

### `PermissionsPanel`
```
Props:
  selectedNames: String[]   // names of selected recipients (drives the title + empty state)
  permissions:   Array      // combined permission rows to render (see below)

Events:
  toggle(permId, column)    // a checkbox was toggled; column ∈ 'allow' | 'deny' | 'delegate'
```
The panel is **presentational** — it does not mutate data. It emits `toggle`, and the parent
(`RightsDialog`) applies the change to every selected recipient.

---

## 3. Data & behaviour details

### Mock data
- `src/data/mockSearchData.js` — the searchable people/groups/units/roles + `searchMockData(query)`.
  Row shape: `{ id, name, avatarType, avatarSrc, subText, tag }`.
- `src/data/mockPermissions.js` — the 16 permission rows, the presets per level (`TEMPLATES`),
  and `getPermissionTemplate(level)` which returns rows as `{ id, name, allow, deny, delegate }`.

### Combine semantics
When multiple recipients are selected in Rights, `RightsDialog` computes `combinedPermissions`:
a cell is shown **checked only if it is checked for _every_ selected recipient** (the shared
baseline / intersection). Toggling a cell writes that new value to **all** selected recipients.
> This is a product decision worth confirming. Alternatives are a union (checked if _any_ has it)
> or a tri-state "mixed" indicator — the design didn't specify, so intersection + bulk-write was chosen.

### Permission presets
Switching a recipient to `Read/display` / `Write/modify` / `Full access` overwrites their table
from `TEMPLATES`. `Custom` leaves the table as-is for free editing. The template values are
illustrative placeholders — the real levels/defaults must come from the backend.

---

## 4. Integration checklist

What must be replaced/wired when building this for real:

- [ ] **Search** — replace `searchMockData()` with the real people/groups/units/roles search API (debounced).
- [ ] **Permission model** — replace `mockPermissions.js` rows, level presets, and the Allow/Deny/Delegate
      shape with the real rights model. Confirm the [combine semantics](#combine-semantics).
- [ ] **`done` event** — persist the recipients + their permissions (the prototype only holds state in memory).
- [ ] **`add` / `remove` / `update:permission`** — wire to create/update/delete access grants (optimistic vs. server-confirmed?).
- [ ] **`itemName`** — pass the real object name; the title reads `Rights for <itemName>` / `Share <itemName>`.
- [ ] **Avatars** — `AvatarItem type="Avatar"` expects a photo URL; the fallback icons cover User/Group/Unit/Role.
- [ ] **i18n** — all copy is hard-coded English.
- [ ] **A11y pass** — dialogs use `role="dialog"`/`aria-modal`; still needs focus-trap, `Esc`-to-close, and focus return on close.

---

## 5. Design system

- **Tokens:** `src/styles/tokens.css` (colours, spacing, radii, typography, shadows). Prefer these over
  raw hex — a few one-off hex values remain in components where a token didn't exist (e.g. `#e5e5e5`
  hover, `#d3200e` delete red) and should map to real tokens on integration.
- **Brand:** WebCube primary `#052474`.
- **Font:** self-hosted **Figtree** variable font (`src/styles/`), weights 400/500/600/700.

## 6. Figma source

File: `WebCube NEW Dialogs & Controls` (`MVZoWd5ixOh3dF5QUUEOgU`). Key frames:

| Frame | Node ID |
| --- | --- |
| Rights dialog — advanced mode + permissions table | `29577-2999` |
| Footer with "Advanced options" link | `29585-3651` |
| Link-button states (default / hover / disabled) | `29585-3633` |
| Permissions table — empty state | `29585-3750` |
| Recipient row — delete on hover | `29620-4850` |
| Search result — "Already added" | `29621-4925` |

---

## 7. Known limitations / decisions

- **In-memory only** — nothing persists; reload resets the dialog.
- **Combine = intersection + bulk-write** (see above) — confirm with product.
- **`Custom` in Share** — the shared `ShareItem` dropdown still lists `Custom`, but the Share dialog
  hides the dropdown entirely, so it's not reachable there.
- **`RadioButton.vue`** is no longer used by either dialog (selection moved to checkboxes) but is kept
  in the component set / Components tab.
- **Single-page** — tab switching is local state in `App.vue`; there's no routing.

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```
