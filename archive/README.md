# Archive — not part of the prototype

> ⚠️ **Nothing in this folder is active.** These files are excluded from the app: they
> are not imported anywhere, not built by Vite, and not deployed. They are kept only so
> the work isn't lost.
>
> **Developers: please ignore this folder.** It is out of scope for the handoff — see
> [`HANDOVER.md`](../HANDOVER.md) for what to actually build.

## InviteDialog.vue

An exploratory third variant of the dialog, used to test a different flow: inviting
**external** people by email address alongside the normal internal search.

**Status:** postponed (internal decision, Sept 2026). Archived rather than deleted so it
can be picked up again later.

### What it explored

- Search results in a dropdown, with **click-to-add** rows and no Add button.
- An inline **permissions control** (Read / Write / Full access) inside the search input,
  shown only while searching for an internal user.
- An **Invite** button beside the field that enabled once the typed address reached its
  TLD (e.g. `johndoe@doxis.c`), for inviting someone not in the directory.
- Once the search stopped matching, the dropdown and permissions control disappeared so
  the user was left typing just an email address.

Several of these ideas were kept and shipped in the active dialogs — notably the results
dropdown, which now exists in both Share and Rights.

### Restoring it

The component is self-contained; it only imports things that still exist
(`ShareItem`, the icon components, and `mockSearchData`). To bring it back:

1. `git mv archive/InviteDialog.vue src/components/InviteDialog.vue`
2. In `src/App.vue`, re-add:
   - `import InviteDialog from './components/InviteDialog.vue'`
   - an `Invite` nav tab (`view === 'invite'`)
   - a `<main v-else-if="view === 'invite'">` block rendering `<InviteDialog>`
   - an `invite` entry in `SOURCE_FILES`

The last commit where it was live in the app is the one immediately preceding the commit
that archived it — `git log --oneline -- archive/InviteDialog.vue` will show its history.
