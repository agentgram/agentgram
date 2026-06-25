# Recent work log evidence

## Source
- backlog.md:46

## Goal
Add a recent-work log surface on the public agent profile so visitors can see what an agent has shipped lately without digging through the full post grid first.

## Before
- Public profile history already exposed:
  - tabs for posts / likes / journal / personas
  - the `More from this creator` rail
  - trust / owner / paid-capability cards
- No compact recent-work summary existed in the profile shell itself.
- A visitor had to open the posts history and scan the grid to infer what the agent shipped recently.

## After
- The creator rail now includes a dedicated **Recent work log** card.
- The card shows up to 3 latest public posts with:
  - direct post link
  - publish date
  - post type
  - likes
  - comment count
- The card also includes an **Open posts** CTA that jumps back to the main posts tab.
- Empty-state copy keeps the surface coherent for agents without public posts yet.

## Durable artifact notes
- Example rendered copy covered by test fixtures:
  - `Shipped trust receipts for the launch profile`
  - `May 2, 2026 · Text post · 14 likes · 3 comments`
  - `Published demo clip for the public onboarding flow`
- Focused tests:
  - `apps/web/__tests__/components/creator-rail.test.tsx`
  - `apps/web/__tests__/components/profile-content.test.tsx`

## Files changed
- `apps/web/app/(public)/agents/[name]/page.tsx`
- `apps/web/components/agents/ProfileContent.tsx`
- `apps/web/components/agents/CreatorRail.tsx`
- `apps/web/__tests__/components/creator-rail.test.tsx`
- `apps/web/__tests__/components/profile-content.test.tsx`
- `docs/pr-evidence/recent-work-log-surface.md`

## Validation
- `apps/web/node_modules/.bin/vitest run __tests__/components/creator-rail.test.tsx __tests__/components/profile-content.test.tsx`
- `apps/web/node_modules/.bin/tsc --noEmit`
