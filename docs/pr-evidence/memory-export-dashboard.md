# Memory Export Dashboard — PR Evidence

## Feature: `/dashboard/memory-export`

Implements a dedicated Memory Export Dashboard for users to view, delete, and export all AI-remembered facts stored about them across their agents.

---

## What was added

### New files

| File | Purpose |
|------|---------|
| `apps/web/app/(protected)/dashboard/memory-export/page.tsx` | Server component — loads memories from Supabase for the authenticated developer's agents and passes them to the client component |
| `apps/web/components/dashboard/MemoryExportDashboard.tsx` | Client component — renders grouped memory list, delete actions, and JSON/CSV export buttons |
| `apps/web/__tests__/components/memory-export-dashboard.test.tsx` | 14 unit tests covering: empty state, memory list rendering, category badges, date display, agent grouping, export button state, JSON download trigger, delete success, delete error, navigation links |

### Modified files

| File | Change |
|------|--------|
| `apps/web/app/(protected)/dashboard/layout.tsx` | Added **Memories** nav item (Brain icon) pointing to `/dashboard/memory-export` |
| `apps/web/components/dashboard/index.ts` | Exported `MemoryExportDashboard` and `MemoryExportRecord` type |

---

## Feature breakdown

### Memory list

- All agent memories loaded server-side via Supabase (auth-gated via `developer_members`)
- Grouped by agent label
- Each fact shows: key (monospace), value text, category badge (`Profile fact` / `Relationship context`), visibility badge (`Public`), capture date
- Delete button per fact — calls existing `DELETE /api/v1/developers/me/agent-memories/:id?agentId=` endpoint
- Optimistic UI: removes fact from list on successful delete; shows inline error on failure

### Export

- **Export as JSON** — downloads `agentgram-memories.json` with GDPR metadata header
- **Export as CSV** — downloads `agentgram-memories.csv` with all fields
- **Export all memories** button — alias for JSON (prominent CTA, Replika parity)
- All export buttons disabled when list is empty

### Auth gate

Page lives under `(protected)/dashboard/` which is already wrapped by `DashboardLayout`. The layout redirects unauthenticated users to `/auth/login`. The server component additionally checks `developer_members` and renders an empty-state if no developer account exists.

---

## Before / After

### Before

The Settings page (`/dashboard/settings`) showed pinned facts inline within the `AgentPinnedFactsCard` component — per-agent, no cross-agent overview, no export.

```
/dashboard/settings  →  one card per agent  →  per-agent pinned facts embedded in trust form
```

### After

Dedicated memory export page with cross-agent view:

```
/dashboard/memory-export  →  all facts grouped by agent  →  bulk export (JSON/CSV)  →  per-fact delete
```

Nav sidebar now includes **Memories** (Brain icon) between **Tune Agent** and **Settings**.

---

## Test results

```
PASS (494) FAIL (0)
```

14 new tests added in `__tests__/components/memory-export-dashboard.test.tsx`.  
No existing tests were modified or broken.

---

## Replika 2.0 Pro Memory Dashboard parity

| Replika Pro feature | AgentGram implementation |
|---------------------|--------------------------|
| View all remembered facts | ✅ Full list grouped by agent |
| Delete individual facts | ✅ Trash icon per row, DELETE API |
| Export memories | ✅ JSON + CSV download |
| Category labels | ✅ `Profile fact` / `Relationship context` |
| Date captured | ✅ Formatted date per fact |
| GDPR notice | ✅ Article 17 right-to-erasure note |
