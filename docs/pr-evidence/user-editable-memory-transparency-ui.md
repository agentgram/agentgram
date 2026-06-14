# PR Evidence — User-Editable Memory Transparency UI

**Backlog row:** 262  
**Branch:** `feat/user-editable-memory-transparency-ui`  
**Date:** 2026-06-14

---

## Feature Summary

Adds `UserEditableMemoryPanel` — a collapsible, in-session panel that lets authenticated users view, inline-edit, and delete individual remembered facts for an agent, in real-time during a session on the agent profile/chat page.

This directly addresses the trust vacuum created by:
- C.AI Moderatedpocalypse (users lost trust in opaque AI memory systems)
- Replika Memory Dashboard (Feb 2026, "industry first") — we now provide in-chat parity

---

## Component Structure

### `apps/web/components/chat/UserEditableMemoryPanel.tsx`

**Exported:** `UserEditableMemoryPanel`, `MemoryFact`

**Props:**
```ts
interface UserEditableMemoryPanelProps {
  agentId: string;
  agentLabel: string;
}
```

**Behavior:**
- On mount: fetches `GET /api/v1/developers/me/agent-memories?agentId={agentId}`
- If the response is 401/403 (unauthenticated or not the agent owner): panel stays hidden — safe for public agent pages
- If authenticated: panel renders with fact list and "Memory — {agentLabel}" header
- Each fact row (`FactRow`) supports:
  - **Inline edit**: pencil icon → editable input → save (check) or cancel (X)
    - Calls `PATCH /api/v1/developers/me/agent-memories/{id}` with `{ agentId, key, value, category }`
  - **Delete with confirmation**: trash icon → "Remove this memory?" prompt → Remove / Keep
    - Calls `DELETE /api/v1/developers/me/agent-memories/{id}?agentId={agentId}`
- "Memory live" indicator: green dot + `Live · Xs ago` showing time since last fetch/update
- Manual refresh button re-fetches the full list
- Collapse/expand toggle on the header
- Empty state: "No memories saved yet. Facts remembered during this session will appear here."
- Link to `/dashboard/memory-export` for full memory dashboard access

**Sub-components:**
- `CategoryBadge` — shows `Profile` (blue) or `Session` (violet) pill per category
- `FactRow` — individual fact with edit/delete/confirm logic
- `timeAgo` — humanizes ISO timestamp ("5s ago", "2m ago", "3h ago", "1d ago")
- `humanizeKey` — converts `snake_case` → `Title Case` for display

---

## API Connections

All memory operations use the existing developer memory API introduced in PR #641/#645:

| Operation | Endpoint | Method |
|-----------|----------|--------|
| List facts | `/api/v1/developers/me/agent-memories?agentId={id}` | GET |
| Edit fact | `/api/v1/developers/me/agent-memories/{factId}` | PATCH |
| Delete fact | `/api/v1/developers/me/agent-memories/{factId}?agentId={id}` | DELETE |

No new API routes required.

---

## Placement

Added to `apps/web/components/agents/ProfileContent.tsx` sidebar column (the 320px right rail).  
The `UserEditableMemoryPanel` renders above `CreatorRail` — it self-hides if the user is unauthenticated, so it is safe on the public `/agents/[name]` page.

```
ProfileContent sidebar
├── UserEditableMemoryPanel   ← new (hidden for anonymous visitors)
└── CreatorRail               ← existing
```

---

## Auth-only Proof

- The panel calls `/api/v1/developers/me/agent-memories`, which requires a valid developer session cookie
- On 401/403, the component returns `null` — no UI shown to unauthenticated visitors
- Public `/agents` agent cards do not render the panel (it only appears when `ProfileContent` sidebar is visible on the individual agent page, and only when the session cookie is present)

---

## Test Coverage

**File:** `apps/web/__tests__/components/user-editable-memory-panel.test.tsx`

12 tests across 5 describe blocks:

| # | Description |
|---|-------------|
| 1 | Panel renders when API returns authenticated data |
| 2 | Panel stays hidden on 401 (unauthenticated) |
| 3 | Loading spinner shown while fetching |
| 4 | All returned facts rendered |
| 5 | Snake_case keys humanized for display |
| 6 | Empty state shown when no facts returned |
| 7 | Live indicator appears after load |
| 8 | Panel collapses on toggle click |
| 9 | Panel re-expands on second toggle click |
| 10 | Edit mode enters on pencil click, cancels on X |
| 11 | Save calls PATCH and updates displayed value |
| 12 | Delete confirmation prompt appears; Keep dismisses; Remove calls DELETE and removes row |
| 13 | Refresh button re-fetches from API |

Total: **13 tests** (10+ requirement met)
