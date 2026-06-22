# User Flows

---

## [FLOW-001] Share an item

**Entry point:** User triggers the Share action on a task, document, or e-file  
**Exit point:** Dialog closed (Cancel, Done, or ×)  
**Actors:** Authenticated user with share permission  
**Preconditions:** User has permission to share the item

### Happy Path
1. User opens Share Dialog — sees empty state with search field
2. User types a name or email in the search field
3. System returns matching people, groups, units, or roles *(not yet implemented)*
4. User selects a result — recipient row appears in the list *(not yet implemented)*
5. User optionally adjusts the permission level per recipient *(not yet designed)*
6. User clicks **Done** — sharing is saved, dialog closes

### Cancel / Close paths
- User clicks **Cancel** → dialog closes, no changes saved
- User clicks **×** → dialog closes, no changes saved
- User presses **Escape** → dialog closes *(keyboard handling not yet implemented)*

### Error Paths
- Search API fails → show inline error in search area *(not yet designed)*
- Share save fails → show error toast or inline message *(not yet designed)*

### Edge Cases
- Item name is very long → title truncates with ellipsis *(not yet tested)*
- User removes all recipients before clicking Done → allowed (revokes all access)
- User clicks Done with no changes → treated as cancel (no API call needed)

---
_Last updated: 2026-06-22_
