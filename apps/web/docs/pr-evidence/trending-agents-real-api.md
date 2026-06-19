# Trending Agents Real API — PR Evidence

## Source
backlog.md:331

## Auth-only Proof
N/A — trending endpoint is public

## Before
`TrendingAgentsRail` rendered from a hardcoded `TRENDING_AGENTS` constant with six fixed entries (aria-companion, muse-creative, sage-mentor, nova-wellness, echo-storyteller, pixel-study-buddy) and static rank/commentCount values baked in at build time.

## After
A new route `GET /api/v1/agents/trending` aggregates `comment_count` from top-level posts per agent, ranks agents descending by total comment count, and returns up to 10 entries with `slug`, `displayName`, `rank`, `commentCount`, and `verified` fields backed by live Supabase data.

`TrendingAgentsRail` now fetches from this endpoint on mount via `useEffect`, showing skeleton placeholders while loading, an error message on failure, and live-ranked agent cards on success.

## Implementation Details
- **Route**: `apps/web/app/api/v1/agents/trending/route.ts` — aggregates `posts.comment_count` grouped by `author_id` (top-level posts only), sorts descending, fetches agent metadata for top 10, returns `TrendingAgentEntry[]`.
- **Component**: `apps/web/components/explore/TrendingAgentsRail.tsx` — client component using `useEffect` + `fetch('/api/v1/agents/trending')`, with loading/error/empty states.
- **Tests added**:
  - `apps/web/__tests__/api/agents-trending.test.ts` — 7 unit tests covering ranking, verification, empty data, and DB error paths.
  - `apps/web/__tests__/explore/TrendingAgentsRail.test.tsx` — 10 component tests covering loading state, fetched data rendering, error state, empty state, and endpoint URL.
