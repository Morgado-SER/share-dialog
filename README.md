# Share Dialog

A Vue 3 + Vite prototype for the WebCube / Doxis design system, covering two related access-management dialogs built from the same components.

## 🔗 Live prototype

**[morgado-ser.github.io/share-dialog](https://morgado-ser.github.io/share-dialog/)**

The prototype has three tabs:

| Tab | What it shows |
| --- | --- |
| **Share** | The simple dialog — invite people to an item. |
| **Rights** | The advanced dialog — invite people *and* manage granular permissions. |
| **Components** | The building blocks (avatars, share items, link-button states). |

## The two dialogs

Both dialogs share a search-and-invite core: search people, groups, units, or roles, add them, and see who the item is shared with.

### Share (simple)

The lightweight variant for quickly inviting people.

- Search results show an **Add** button; already-added people surface with an **"Already added"** label.
- The "Shared with" list shows each recipient with a **delete icon** that appears on row hover.
- No permission controls — the intent is simply to grant access.

### Rights (advanced)

The full variant for fine-grained access control.

- Each recipient has a **permission dropdown**: *Read/display*, *Write/modify*, *Full access*, or *Custom* — each preset fills the permissions table accordingly.
- **Show advanced options** expands the dialog to reveal a per-permission **table** (Allow / Deny / Delegate) with sortable columns and truncation tooltips.
- **Multi-select checkboxes** let you pick several recipients at once; the table then shows their **combined** permissions (the shared baseline), and edits apply to everyone selected.
- Deselect everyone to see the table's empty state; the link toggles back to **Hide advanced options** to collapse.

## Tech

- **Vue 3** (`<script setup>` SFCs) + **Vite**
- Design tokens as CSS custom properties (`src/styles/tokens.css`)
- Self-hosted **Figtree** variable font
- No runtime dependencies beyond Vue

## Project structure

```
src/
├── App.vue                      # Prototype shell + tab navigation
├── components/
│   ├── ShareDialog.vue          # Share dialog (simple)
│   ├── RightsDialog.vue         # Rights dialog (advanced)
│   ├── PermissionsPanel.vue     # Advanced permissions table
│   ├── ShareItem.vue            # Recipient / search-result row
│   ├── AvatarItem.vue           # Avatar (person, group, unit, role)
│   ├── RadioButton.vue
│   └── icons/                   # Inline SVG icon components
├── data/
│   ├── mockSearchData.js        # Mock people/groups/units/roles
│   └── mockPermissions.js       # Permission rows + presets
└── styles/tokens.css            # Design tokens
```

> Search and permission data are **mock/placeholder** only — this is a design prototype, not a production integration.

## Run locally

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Deployment

The live prototype **deploys automatically** to GitHub Pages on every push to `main`,
via the [`Deploy to GitHub Pages`](.github/workflows/deploy.yml) workflow (build with
Vite → publish `dist/`). No manual step is needed — push to `main` and the live link
updates once the workflow finishes.

The Vite `base` is set to `/share-dialog/` for production builds so assets resolve under
the repository subpath.
