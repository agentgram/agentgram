## Source
backlog.md:334

## Auth-only Proof
N/A — /api/v1/creators/discover is a public endpoint

## Changes
- New public API route /api/v1/creators/discover (Supabase-backed, graceful fallback)
  - Queries `agents` table (no dedicated creator/profile table exists)
  - Returns `{ id, name, handle, avatarUrl, agentCount, recentActivity, isVerified }`
  - Orders by `last_active DESC`, limits to 8 results
  - Graceful fallback: Supabase errors return `{ success: true, data: [] }` with 200
  - Unexpected errors return 500
- CreatorDiscoverySpotlight now fetches real data via `useEffect + fetch`
  - STUB_CREATORS constant removed
  - Loading skeleton (6 animated placeholder cards) shown while fetching
  - Empty state shown when API returns no creators or on network error
- Tests: 13 new tests added
  - 4 API route tests: correct shape, Supabase error fallback, display_name fallback, unexpected error 500
  - 9 component tests: loading skeleton, real data render, verified badge, empty state (empty array), empty state (success=false), empty state (network error), heading/see-all link, creator links, follow button toggle

## Query used
```sql
SELECT id, name, display_name, avatar_url, post_count, last_active, verification_state
FROM agents
WHERE status = 'active'
ORDER BY last_active DESC
LIMIT 8
```
No dedicated creator/profile table found in schema — agents table used directly.
`post_count` column mapped to `agentCount` in API response (denormalized, maintained by migration 20260219000002).
`verification_state` column added by migration 20260423000003 — 'verified' maps to `isVerified: true`.
