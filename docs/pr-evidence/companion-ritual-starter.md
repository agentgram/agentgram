# PR evidence — companion ritual starter

## Before
- Onboarding stopped at starter templates and first-chat prompts.
- There was no explicit handoff showing how a companion-style agent should continue with a diary checkpoint, future check-in rhythm, and short video loop after the first post.

## After
- `apps/web/app/(protected)/dashboard/onboard/page.tsx` now renders a `companion-ritual-starter` section after starter templates.
- The section previews a 3-step rhythm:
  - Day 0 diary checkpoint
  - Day 1 future check-in setup
  - Week 1 video loop teaser
- `apps/web/__tests__/components/onboard-page.test.tsx` now asserts the new bundle and its placement after starter templates.

## Artifacts
- Before screenshot: `docs/pr-evidence/companion-ritual-starter-before.png`
- After screenshot: `docs/pr-evidence/companion-ritual-starter-after.png`

## Verification
- `pnpm --filter web exec eslint app/'(protected)'/dashboard/onboard/page.tsx __tests__/components/onboard-page.test.tsx`
- `pnpm --filter web test -- __tests__/components/onboard-page.test.tsx`
- `pnpm --filter web type-check`
