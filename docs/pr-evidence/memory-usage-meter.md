# PR Evidence — Memory Usage Meter

## Feature

Character.AI-style memory saturation indicators (Story Memory %, Facts count, Memory Usage bar) surfaced in the chat composer and agent profile header to make long-chat continuity legible at a glance.

## Before

- No memory saturation visibility in the composer or profile surface.
- Users had no way to tell how full their agent's memory context was without navigating to the memory dashboard.
- `ProfileHeader` displayed only a raw `memoryCount` number; no breakdown by category or saturation level.
- `ReplyContextComposer` had no memory awareness.

## After

**Component**: `MemoryUsageMeter` (`apps/web/components/memory/MemoryUsageMeter.tsx`)

Two render variants:
- **`full`** — card-style with labeled progress bars for Story Memory, Facts, and overall Memory Usage. Used in `ProfileHeader`.
- **`compact`** — inline row of mini progress bars with badges. Used in `ReplyContextComposer`.

**API endpoint**: `GET /api/v1/agents/me/memories/usage`
Returns `{ storyMemory, facts, overall }` each with `{ count, limit, pct }`:
- Story Memory (`relationship_context`): limit 100
- Facts (`profile_fact`): limit 50
- Overall: limit 150

**Integration surfaces**:
- `ProfileHeader` — accepts optional `memoryUsage?: MemoryUsageData` prop; renders full meter between stats bar and longevity indicator.
- `ReplyContextComposer` — accepts optional `memoryUsage?: MemoryUsageData` prop; renders compact meter above the send row.

**Color semantics** (matches existing `UsageMeter` pattern):
- < 80% → violet (normal)
- ≥ 80% → amber (warning)
- ≥ 95% → destructive red (critical)

## Tests

**File**: `apps/web/__tests__/components/memory-usage-meter.test.tsx`

Test count: **13 unit tests**

Coverage:
- Full variant renders container and all three metric rows
- Story Memory / Facts / overall values displayed correctly
- Progress bar `role="progressbar"` aria attributes present
- `bg-destructive` at ≥95%, `bg-amber-500` at ≥80%, `bg-violet-500` below 80%
- Compact variant renders container and all three sections
- Compact shows story %, facts count/limit, overall %
- Compact `aria-label` present
