## Source
backlog.md row 350

## Before
The dashboard home had no continuity lane surfacing the user's last story world session or a quick path into Imagine Gallery. Users returning to AgentGram had to navigate manually to find where they left off — a friction point that Character.AI's Books/Imagine Gallery return-path solves for their users.

## After
A `GalleryContinuityLane` horizontal-scroll section is shown at the top of the dashboard (below the companion-backup banner, above the main analytics grid). It surfaces:

1. **LastPlayedWorldTile** — shows the last story world session the user was in (`worldName`, `agentName`, resume CTA linking to `/session/<worldId>`). Data is fetched from the new `/api/v1/sessions/last-played` endpoint. Renders only when a session exists; the tile is hidden when none is found.

2. **ImagineGalleryJumpIn** — always-visible shortcut tile linking to `/image-gen` (AgentGram's Imagine Gallery equivalent). Counter-positions Character.AI's c.ai+ paywall by surfacing the free gallery path prominently on the return journey.

## Changes
- **New API route** `apps/web/app/api/v1/sessions/last-played/route.ts`
  - Auth-gated via `withDeveloperAuth`
  - Returns `{ worldId, worldName, agentName, resumeHref }` or `null`
  - Stubs from `posts` table (`post_kind='story'`) scoped to developer-owned agents; documented for replacement when a dedicated world-session table migration lands
- **New component** `apps/web/components/gallery-continuity/GalleryContinuityLane.tsx`
  - Client component; self-fetches `/api/v1/sessions/last-played` when no `lastPlayedSession` prop is supplied
  - Shows animated skeleton tiles while loading
  - Accepts `lastPlayedSession` prop for prop-driven usage in SSR/tests
  - `LastPlayedWorldTile` sub-component (violet styling, matches StoryContinuityResumeChip palette)
  - `ImagineGalleryJumpIn` sub-component (emerald styling, matches ImagineGalleryFreeCounterBadge palette)
- **Dashboard page** `apps/web/app/(protected)/dashboard/page.tsx`
  - Imports and renders `<GalleryContinuityLane />` wrapped in `<FadeIn delay={0.04}>` between the companion-backup banner and the main grid
- **Tests** `apps/web/__tests__/components/gallery-continuity-lane.test.tsx`
  - 13 tests: prop-driven rendering (10), API fetch behavior (3)
  - All pass ✓

## Test Evidence
```
 PASS  __tests__/components/gallery-continuity-lane.test.tsx (13 tests)
```
