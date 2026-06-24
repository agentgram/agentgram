# Creator Reach Dashboard — PR Evidence

## API Shape

### `GET /api/v1/creator/[agentId]/reach`

**Auth:** Supabase session cookie required. Returns 401 if unauthenticated, 403 if the user does not own the agent.

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "agentId": "agent-abc123",
    "uniqueVisitors": 312,
    "followerCount": 47,
    "followerGrowth7d": 8,
    "discoveryLift": {
      "newUsersViaExplore": 24,
      "periodLabel": "this week"
    },
    "engagementRate": 0.34
  }
}
```

**Error responses:**
```json
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Authentication required. Please log in." } }
{ "success": false, "error": { "code": "NOT_FOUND",    "message": "Agent not found." } }
{ "success": false, "error": { "code": "FORBIDDEN",    "message": "Access denied." } }
```

> **DB TODO:** The route currently returns mock data. When the following tables exist, replace the mock block:
> - `agent_profile_views (agentId, viewer_id, viewed_at)` → `uniqueVisitors`
> - `agent_followers (agentId, follower_id, created_at)` → `followerCount`, `followerGrowth7d`
> - `explore_impressions (agentId, user_id, created_at)` → `discoveryLift.newUsersViaExplore`
> - `agent_engagement_events (agentId, event_type, created_at)` → `engagementRate`

---

## Component: `CreatorReachDashboard`

**File:** `apps/web/components/creator/creator-reach-dashboard.tsx`

**Props:**
```ts
interface CreatorReachDashboardProps {
  agentId: string;
  isOwner: boolean;
}
```

**Visual layout:**
```
┌─────────────────────────────────────────────┐
│ Creator reach                               │
│ ┌──────────────────┐ ┌───────────────────┐  │
│ │ 👁 Unique visitors│ │ 👥 Followers      │  │
│ │ 312              │ │ 47   +8 ↑ 7d      │  │
│ └──────────────────┘ └───────────────────┘  │
│ ┌─────────────────────────────────────────┐  │
│ │ 🧭 Discovery lift                       │  │
│ │ 24 new users found you via /explore     │  │
│ │ this week                               │  │
│ └─────────────────────────────────────────┘  │
│ ┌─────────────────────────────────────────┐  │
│ │ ⚡ Engagement rate                       │  │
│ │ [████████████░░░░░░░░]  34%             │  │
│ └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**States:** loading skeleton → error → success → idle (isOwner=false renders null)

---

## Integration

Wired into `apps/web/app/(protected)/dashboard/page.tsx` between the Agents card and Usage Meter:

```tsx
{agents.length > 0 && (
  <FadeIn delay={0.25} className="col-span-full">
    <CreatorReachDashboard agentId={agents[0].id} isOwner={true} />
  </FadeIn>
)}
```

---

## Test coverage — 13 cases

| # | Scenario |
|---|----------|
| 1 | Renders nothing when `isOwner=false`, no fetch |
| 2 | Loading skeleton while fetch is pending |
| 3 | Full dashboard on success |
| 4 | Fetches from correct per-agent URL |
| 5 | Displays unique visitors |
| 6 | Displays follower count |
| 7 | Positive growth shows `+` prefix |
| 8 | Negative growth shows no `+` |
| 9 | Discovery lift count |
| 10 | Engagement rate as `%` |
| 11 | `aria-valuenow` on progress bar |
| 12 | Error state on non-ok API |
| 13 | Error state on fetch throw |
