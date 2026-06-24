## Source
backlog.md:332

## Auth-only Proof
N/A — component renders on authenticated dashboard only

## Changes
- New API route `/api/v1/sessions/last-story` (auth-gated via `withDeveloperAuth`)
  - Returns `{ worldName, agentName, resumeHref, agentSlug, worldSlug, chapterLabel? }` or null
  - Queries `posts` table with `post_kind='story'` scoped to developer-owned agents
  - NOTE: No dedicated `story_sessions` table exists yet. A migration should be added when story-mode session tracking is implemented. The route documents the missing migration inline.
- `StoryContinuityResumeChip` now self-fetches from the API when no `lastSession` prop is supplied
  - Shows animated skeleton while loading
  - Hides (renders null) if the API returns no session or on error
  - Still accepts `lastSession` prop for prop-driven usage (SSR, tests)
- `apps/web/app/(public)/page.tsx` updated: hardcoded session props removed, chip now fetches autonomously
- Tests: 15 new tests added (7 API route tests in `sessions-last-story.test.ts` + 4 new component fetch tests; 11 existing prop-driven tests preserved and reorganized)
