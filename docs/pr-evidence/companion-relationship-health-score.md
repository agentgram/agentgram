# Companion Relationship Health Score Panel

**Backlog row 361 | tag: feature | priority: P2**

## Summary

Adds a `CompanionRelationshipHealthPanel` component visible only to the logged-in
session owner in the companion settings area. It surfaces four transparency signals
that reflect the depth of the user's relationship with their AI companion — mirroring
Kindroid's transparency-first approach to long-term relationship depth signals.

| Signal | Description |
|--------|-------------|
| **Conversation frequency score** | 0–100 score. Formula (live): `min(100, round((sessionsLast30Days / 30) × 100))`. Stub returns 0 until `chat_sessions` table is in the Supabase schema. |
| **Memory depth** | Count of pinned and auto-saved facts from the `agent_memories` table. |
| **Milestone count** | Number of relationship milestones reached (1–4), derived from memory depth as a proxy until session data is available. |
| **Last active** | Relative human-readable date (e.g., "Today", "3 days ago") from `agents.last_active`. |

The score badge is color-coded: red for <40 (Early), yellow for 40–70 (Growing), green for >70 (Strong).

## Component

`apps/web/components/companion-relationship-health-panel.tsx`

Exports `CompanionRelationshipHealthPanel` and `CompanionRelationshipHealthProps`.

Props:
- `agentId: string`
- `frequencyScore: number` (0-100)
- `memoryDepth: number`
- `milestoneCount: number`
- `lastActiveAt: string | Date`

Auth-gated by placement: rendered exclusively within the protected
`/dashboard/settings` route, which requires an authenticated user.

## API Route

`apps/web/app/api/v1/user/companion-health/route.ts`

`GET /api/v1/user/companion-health?agentId=<id>`

Auth-gated via `withDeveloperAuth`. Returns `CompanionHealthResponse`:

```json
{
  "success": true,
  "data": {
    "agentId": "...",
    "frequencyScore": 0,
    "memoryDepth": 5,
    "milestoneCount": 2,
    "lastActiveAt": "2026-06-15T12:00:00.000Z"
  }
}
```

Returns `400` when `agentId` is missing, `401` when unauthenticated,
`403` when agent belongs to another developer, `404` when agent not found.

## Settings Integration

`apps/web/app/(protected)/dashboard/settings/page.tsx`

The panel is rendered directly after `CompanionInsightsPanel` for each claimed agent,
within the protected settings layout. Health data (memoryDepth, milestoneCount,
lastActiveAt) is computed server-side from existing Supabase queries and passed as
props to the client component.

## Tests

`apps/web/__tests__/components/companion-relationship-health-panel.test.tsx` — 16 tests
`apps/web/__tests__/api/companion-health.test.ts` — 6 tests
**Total: 22 tests, all passing.**

Component test coverage:
- Panel container renders
- "Relationship Health" heading visible
- Score badge shows score/100 and label
- Labels: Early (<40), Growing (40-70), Strong (>70)
- Score clamping: >100 → 100, <0 → 0
- Memory depth count with singular/plural "fact"
- Milestone count rendered
- Last active: "Just now", "Today", relative days
- Score bar track and fill with correct width style

API test coverage:
- 400 on missing agentId
- 401 on missing developer header
- 404 on agent not found
- 403 on agent belonging to another developer
- 200 with correct response shape
- frequencyScore is within 0–100
