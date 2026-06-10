# PR Evidence: Shared-Note Scope Picker

**Branch**: feat/shared-note-scope-picker  
**Backlog row**: 134

---

## What changed

### Before

When saving a roleplay fact/note via `AgentPinnedFactsCard`, the user only had a single checkbox — **"Public memory"** — to toggle visibility. This was a boolean `isPublic` field that mapped directly to `is_public` in the database. There was no concept of group-scoped notes or distinction between private and group collaboration.

The API payload looked like:
```json
{ "agentId": "...", "key": "...", "value": "...", "category": "...", "isPublic": false }
```

Memory cards showed a plain text annotation `· Public` or `· Private` inline with the category label.

### After

Three visibility scopes are now available before saving:

| Scope | Icon | Who can see |
|---|---|---|
| **Private** | Lock | Only the saving user |
| **Group** | Users | Shared with collaborators |
| **Public Canon** | Globe | Visible on the agent profile |

**New `NoteScope` type** added to `packages/shared/src/types/agent-memory.ts`:
```typescript
export type NoteScope = 'private' | 'group' | 'public_canon';
```

**New `SharedNoteScopePicker` component** at `apps/web/components/memory/SharedNoteScopePicker.tsx`:
- Compact `radiogroup` with 3 card-style buttons
- Each option shows icon, label, and description
- Accessible: `role="radiogroup"`, `role="radio"`, `aria-checked`
- Also exports `NoteScopeBadge` for displaying the scope on saved memory cards

**Updated `AgentPinnedFactsCard`**:
- `MemoryDraft.isPublic: boolean` → `MemoryDraft.scope: NoteScope`
- "Public memory" checkbox replaced with `SharedNoteScopePicker` (in both "Remember" and "Edit" forms)
- Memory cards in the full ledger now show `NoteScopeBadge` instead of plain text
- API calls now send `scope` instead of `isPublic`

**Updated API routes** (`/api/v1/developers/me/agent-memories`):
- Accept `scope?: NoteScope` in POST and PATCH bodies
- Derive `is_public` from scope (`public_canon` → `true`, others → `false`)
- Fall back to legacy `isPublic` field when `scope` is absent for backward compatibility

---

## Test coverage

- **New**: `apps/web/__tests__/components/memory/SharedNoteScopePicker.test.tsx` — 16 tests covering rendering, accessibility, onChange callbacks, disabled state, label/description content, prop updates, and `NoteScopeBadge` variants
- **Updated**: `apps/web/__tests__/components/agent-pinned-facts-card.test.tsx` — POST/PATCH assertions updated from `isPublic: false` to `scope: 'private'`

---

## No DB migration required

`scope` is a client-side concept. The DB continues to store `is_public`. The scope is derived on read (`is_public: true` → `public_canon`, `false` → `private`). The `group` scope will also map to `is_public: false` until a DB migration adds a dedicated column.
