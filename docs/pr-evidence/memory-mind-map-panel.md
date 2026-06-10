# Memory Mind Map Panel — PR Evidence

Source: backlog.md row 204

## Feature Description

Adds a **Memory Mind Map** panel (`/dashboard/memory-map`) that visualizes linked memory nodes and fact relationships for each of a developer's agents.

The panel groups agent memories into two named branches:

| Branch | Category key | Description |
|--------|-------------|-------------|
| Profile Facts | `profile_fact` | Stable identity attributes the agent remembers about itself |
| Relationship Context | `relationship_context` | Contextual facts the agent remembers about people it interacts with |

Each node displays:
- The memory **key** (colored by category)
- The memory **value** (truncated at 2 lines)
- A `public` badge when `is_public = true`

A summary bar shows total memory count + per-category breakdown. Category filter chips let the developer narrow the view to one branch. A refresh button re-fetches on demand.

### Visualization approach

No third-party graph library is used. The tree structure is implemented via CSS (grid layout + connecting lines via `border` divs and `ChevronRight` icons), keeping the bundle lean and the implementation fully auditable.

### Access path

`/dashboard/memory-map` — new sidebar nav item "Memory Map" (MapIcon) added between "Memories" and "Settings".

---

## Changed Files

| File | Change type | Notes |
|------|------------|-------|
| `apps/web/components/dashboard/MemoryMindMapPanel.tsx` | **new** | Client component; fetches and renders the mind map |
| `apps/web/app/(protected)/dashboard/memory-map/page.tsx` | **new** | Server page; queries agents and renders a panel per agent |
| `apps/web/app/(protected)/dashboard/layout.tsx` | **modified** | Added `MapIcon` import + "Memory Map" nav item |
| `apps/web/components/dashboard/index.ts` | **modified** | Re-exports `MemoryMindMapPanel` and `AgentMemory` type |
| `apps/web/__tests__/components/memory-mind-map-panel.test.tsx` | **new** | 12 tests covering all panel states and interactions |
| `docs/pr-evidence/memory-mind-map-panel.md` | **new** | This file |

### API used

`GET /api/v1/developers/me/agent-memories?agentId=<id>` — existing developer-facing endpoint (introduced by a prior PR). Returns `{ success: true, data: AgentMemory[] }`.

---

## Test coverage (12 tests)

1. Shows loading state while fetching
2. Renders panel title and agent label
3. Shows empty state when agent has no memories
4. Renders memory nodes grouped by category after fetch
5. Renders profile_fact category branch with description
6. Renders relationship_context category branch
7. Shows correct memory count in the summary bar
8. Shows error state when the fetch request fails
9. Marks a public memory with a "public" badge
10. Filters to profile_fact only when that filter is clicked
11. Filters to relationship_context only when that filter is clicked
12. Re-fetches memories when the refresh button is clicked
13. Shows singular "memory" when count is 1
14. Uses the correct API endpoint with the provided agentId
