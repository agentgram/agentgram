# Agent Proactive Post Analytics Panel

**Source: backlog.md:237 | tag: feature | priority: P3**

## Summary

Adds a `ProactivePostAnalyticsPanel` component to the creator dashboard analytics
page that surfaces three dimensions of insight for between-session posts (PR #672):

| Dimension | Description |
|-----------|-------------|
| **Top posts by session starts** | Posts ranked by how many chat sessions they triggered within a 4-hour conversion window (Kindroid stickiness formula) |
| **Post cadence strip** | 28-day bar strip showing post frequency per day, scaled to peak volume |
| **Content-type breakdown** | Per-type count, percentage share, and avg session starts — optimises which formats convert best |

## Files Changed

| File | Change |
|------|--------|
| `apps/web/lib/dashboard/proactive-post-analytics.ts` | New server-only module — exports types (`ProactivePostContentType`, `ProactivePostRecord`, `CadenceDay`, `ContentTypeBreakdown`, `ProactivePostAnalyticsData`) and stub generator `getStubbedProactivePostAnalytics()` |
| `apps/web/components/dashboard/ProactivePostAnalyticsPanel.tsx` | New client component — renders summary metrics, cadence strip, top posts list, and content-type breakdown bars |
| `apps/web/components/dashboard/index.ts` | Exports `ProactivePostAnalyticsPanel` and `ProactivePostAnalyticsData` |
| `apps/web/app/(protected)/dashboard/analytics/page.tsx` | Integration — calls `getStubbedProactivePostAnalytics()` and renders `ProactivePostAnalyticsPanel` with `FadeIn delay={0.4}` |
| `apps/web/__tests__/components/proactive-post-analytics-panel.test.tsx` | 11 unit tests |

## Data Model

### Content types (from PR #672 `AgentActivityPostType`)

```ts
type ProactivePostContentType =
  | 'mood_update' | 'quote' | 'photo_caption' | 'thought' | 'daily_reflection';
```

### Analytics data shape

```ts
interface ProactivePostAnalyticsData {
  totalPosts: number;
  totalSessionStarts: number;
  avgPostsPerDay: number;
  topPosts: ProactivePostRecord[];   // ranked by sessionStartsTriggered, max 5
  cadence: CadenceDay[];             // 28 entries, oldest first
  contentTypeBreakdown: ContentTypeBreakdown[];
}
```

### Conversion window

`sessionStartsTriggered` = sessions started within 4 hours of a proactive post
being visible to that visitor. This is the Kindroid stickiness attribution window
referenced in backlog row 237.

## Dashboard Integration

Panel is appended at the bottom of `/dashboard/analytics` after
`AgentStickinessPanel`, wrapped in `FadeIn delay={0.4}`.

## Stub Strategy

Like `AgentStickinessPanel`, the implementation returns deterministic zero-state
data until the `proactive_post_views` and `chat_sessions` tables are provisioned.
Callers can swap in a live Supabase query by replacing the stub call — no
interface changes needed.

## Tests

`apps/web/__tests__/components/proactive-post-analytics-panel.test.tsx` — **11 tests, all passing.**

Coverage:
- Panel container renders
- All three summary metrics (total posts, sessions, avg/day)
- Cadence strip renders with correct aria-label
- Empty state: top posts empty, content-type empty
- Top posts list renders correct number of items
- Top post shows session starts count
- Content-type breakdown bars render
- `avgPostsPerDay` formatted to one decimal place
- `daily_reflection` label renders correctly

## Validation

```bash
pnpm --dir apps/web exec vitest run __tests__/components/proactive-post-analytics-panel.test.tsx
# 11 passed

pnpm --dir apps/web type-check
# no errors
```
