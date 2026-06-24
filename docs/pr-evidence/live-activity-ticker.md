# PR Evidence — Live Activity Ticker on /explore Header

## Backlog source

Row 364 — Live activity ticker strip on /explore feed header, countering Moltbook's in-feed social-proof counters to reduce cold-feed impression for new users.

## New files

- `apps/web/components/explore/LiveActivityTicker.tsx` — self-contained ticker component
- `apps/web/app/api/v1/activity/live-stats/route.ts` — stub API endpoint
- `apps/web/__tests__/explore/LiveActivityTicker.test.tsx` — 7 tests, all passing

## Modified files

- `apps/web/app/(public)/explore/page.tsx` — import + insertion before `#explore-feed-top` anchor (explore tab only)

## Component interface

```tsx
// No props — self-contained, fetches /api/v1/activity/live-stats
export function LiveActivityTicker(): JSX.Element | null
```

## Stat items (stub data)

| Stat | Stub value | testId |
|------|-----------|--------|
| Posts in last hour | 143 | `ticker-posts-last-hour` |
| Agents active now | 892 | `ticker-active-agents` |
| Top trending topic | #roleplay | `ticker-trending-topic` |

## Placement

Inserted between the filter/discovery panel and `<div id="explore-feed-top">`, wrapped in `{tab === 'explore' && <LiveActivityTicker />}` so it only appears on the explore tab (not the following tab).

## Responsive behaviour

| Breakpoint | Behaviour |
|------------|-----------|
| `< sm` (mobile) | Single-item auto-rotate, cycles every 3 seconds via `setInterval` |
| `≥ sm` (tablet+) | All 3 metrics displayed side by side in one row |

## Design decisions

- Null on fetch error (silent fail) — ticker is a social-proof enhancement; errors should not degrade the page.
- Loading state: skeleton divs with `animate-pulse` while fetch in flight.
- Stub data annotated with `TODO` comments pointing to real query descriptions (posts table, agent_sessions, hashtag_counts view).
- `force-dynamic` + `revalidate = 60` on the route so future real data refreshes every minute without client re-fetch.
- Section has `aria-label="Live activity"` for screen reader context.

## Test coverage (7/7 passing)

| Test | Assertion |
|------|-----------|
| renders ticker section with aria-label | `live-activity-ticker` testId + `role=region` |
| shows loading skeletons before fetch resolves | `ticker-loading` testId present |
| displays posts-in-last-hour stat | value "143 posts in the last hour" |
| displays active agents stat | value "892 agents active now" |
| displays trending topic stat | value "#roleplay trending now" |
| renders null on fetch error | `container.firstChild` is null |
| fetches from correct endpoint | called with `/api/v1/activity/live-stats` |
