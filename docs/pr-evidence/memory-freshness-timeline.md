# PR Evidence: Memory Freshness Timeline

## Feature

Chronological panel showing when each stored memory fact was last used in a conversation,
so users can prune stale/outdated memories with confidence. Extends PR #723
(MemoryArchitectureDiagram) with temporal frequency signal. Positioned as a Nomi Mind Map
2.0 counter.

---

## Component: `MemoryFreshnessTimeline`

**File:** `apps/web/components/memory/MemoryFreshnessTimeline.tsx`

### Props

| Prop | Type | Description |
|------|------|-------------|
| `facts` | `MemoryFact[]` | Array of memory facts with `id`, `content`, `lastUsedAt` |
| `isLoading` | `boolean` | Shows skeleton loading state when true |
| `onPruneStale` | `() => void` | Optional callback; when provided renders the prune CTA section |

### Staleness Color Coding

| Days since last use | Indicator color | Label |
|--------------------|-----------------|-------|
| 0–13 days | Green (`bg-emerald-500`) | Recent |
| 14–59 days | Amber (`bg-amber-500`) | Weeks old |
| 60+ days | Red (`bg-red-500`) | Stale |

### States

- **Loading**: Three skeleton placeholder rows with `aria-busy="true"` on the container.
- **Empty**: Centered empty state with icon and descriptive message, `role="status"`.
- **Populated**: Sorted list of facts (most recently used first), each showing content and
  a color-coded "Last used X days ago" timestamp.
- **Prune CTA**: When `onPruneStale` is provided, a red-tinted footer section appears
  below the list with a stale count and a "Prune stale memories" button.

### Accessibility

- Root container has `aria-label="Memory freshness timeline"`.
- Fact list uses `role="list"` with `aria-label="Memory facts by freshness"`.
- Each fact row has `role="listitem"` and `aria-label` with the fact content.
- Staleness indicator dot has `aria-label` describing its staleness level.
- Prune button has a descriptive `aria-label` including the stale count.
- Loading state has `aria-busy="true"` and `aria-label`.
- Empty state has `role="status"` and `aria-label`.

---

## Integration

Added to `apps/web/app/(protected)/dashboard/memory-map/page.tsx` below the existing
`MemoryMindMapPanel` list. Auth-gated by the existing `(protected)` route group layout,
which enforces Supabase session validation for all dashboard pages.

---

## Test Coverage

**File:** `apps/web/__tests__/components/memory-freshness-timeline.test.tsx`

16 tests across 6 categories:

| Category | Tests |
|----------|-------|
| Renders facts with timestamps | Renders all 3 facts with correct content and relative timestamps |
| Staleness color coding | Green for <14 days, amber for 14–59 days, red for 60+ days |
| Prune CTA | Renders when callback provided, fires on click, hides when no callback, shows correct stale count |
| Empty state | Renders empty container, correct aria-label, correct message |
| Loading state | Renders loading skeleton, aria-busy=true, hides facts during load |
| Accessibility | aria-label on root, role=list on fact list, role=listitem on rows, aria-label on prune button, aria-label on staleness indicators |

All 1696 tests across the web app pass (confirmed via `pnpm --filter web test`).

---

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/memory/MemoryFreshnessTimeline.tsx` | New component |
| `apps/web/__tests__/components/memory-freshness-timeline.test.tsx` | 16 tests |
| `apps/web/app/(protected)/dashboard/memory-map/page.tsx` | Integrated component below mind map panels |
| `docs/pr-evidence/memory-freshness-timeline.md` | This file |
