# PR Evidence: Kindroid Per-Entry Memory Deprioritize Parity

## Feature
Adds per-entry Deprioritize toggle to the Memory Dashboard, matching Kindroid 2026's individual memory importance-weight UX.

## Before
Memory Dashboard (`/dashboard/memory-export`) shows each memory with only a Delete button. No way to lower the importance of a specific memory without deleting it entirely.

- `MemoryTierTabs` only had `deleting` / `onDelete` props
- `MemoryExportRecord` type had no `priority` field
- No deprioritize API endpoint existed

## After
Each memory entry now has a Deprioritize toggle (ChevronDown / ChevronUp icon):

- **Normal priority**: ChevronDown button with `aria-label="Deprioritize: <key>"` — clicking sets `priority: 'low'`
- **Low priority**: ChevronUp button with `aria-label="Restore priority: <key>"`, plus "Low priority" badge, plus `opacity-50` on the row for visual distinction
- Toggle is optimistic: UI updates immediately, API call fires in background

## Changes

### New API Endpoint
`apps/web/app/api/v1/agents/me/memories/[id]/deprioritize/route.ts`
- `PATCH` handler that accepts `{ agentId: string, deprioritized: boolean }`
- Sets `priority` to `'low'` or `'normal'` in `agent_memories` table
- Protected by `withDeveloperAuth` (line 38 in that file)
- Returns `{ success: true, data }` with updated memory record

### Component Updates
- `MemoryExportRecord` type: added `priority?: 'normal' | 'low'`
- `MemoryExportDashboard`: added `deprioritizing: Set<string>`, `handleDeprioritize()`, passes new props to `MemoryTierTabs`
- `MemoryTierTabs` / `MemoryGroupList`: new `deprioritizing` + `onDeprioritize` props; deprioritize button; "Low priority" badge; `opacity-50` on deprioritized rows

### Page Update
`apps/web/app/(protected)/dashboard/memory-export/page.tsx`
- Supabase `select()` now includes `priority` column
- Maps `priority` into `MemoryExportRecord`

## Auth-only Proof

`apps/web/app/api/v1/agents/me/memories/[id]/deprioritize/route.ts`:

```typescript
// line 38
export const PATCH = withDeveloperAuth(async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const developerId = req.headers.get('x-developer-id');

  if (!developerId) {
    return jsonError('UNAUTHORIZED', 'Not authenticated', 401);
  }
  // ...
  // ensureOwnedAgent() enforces developer owns the agent before writing
```

The `withDeveloperAuth` wrapper (defined in `apps/web/lib/auth/developer.ts`) validates the Supabase session, looks up `developer_members`, and injects `x-developer-id` into request headers. Without a valid authenticated developer session the handler never executes.

## Tests
- `apps/web/__tests__/components/memory-deprioritize.test.tsx` — 11 tests covering toggle UI, badge rendering, aria-labels, opacity class, optimistic updates, and API call payload
- `apps/web/__tests__/api/memory-deprioritize.test.ts` — 6 tests covering priority=low, priority=normal, missing agentId, non-boolean deprioritized, cross-developer rejection, and UNAUTHORIZED path
