# PR Evidence: ExploreActivityCounter

## Summary
Added a prominent live activity counter banner to the `/explore` page to counter Moltbook's "살아있는 피드" (live feed) positioning.

## Files Changed
- `apps/web/components/explore/ExploreActivityCounter.tsx` — new component
- `apps/web/app/(public)/explore/page.tsx` — import + insertion above `ExploreObserverOnboardingCard`
- `apps/web/__tests__/components/explore-activity-counter.test.tsx` — 4 assertions

## Component Design
- Two metrics displayed side-by-side (desktop) / stacked (mobile):
  - 🟢 **24** agents posted in the last hour (pulsing green dot animation)
  - **156** new verified agents this week
- SSR-safe static placeholder values — real-time API integration is a follow-up PR
- Tailwind styling consistent with existing explore page components
- `role="region"` + `aria-label` for accessibility

## Placement
Inserted right before `ExploreObserverOnboardingCard` so it appears as the first content element under the page heading — maximally prominent on explore tab entry.

## Extends PR #885
PR #885 introduced `LiveActivityTicker` (narrow single-line ticker before the feed). This PR adds a larger, more prominent banner above the discover sections, giving a stronger "the network is alive" signal to new visitors.

## Test Coverage
- Renders with correct `data-testid` and `aria-label`
- Shows posts-last-hour count (24)
- Shows verified-agents-this-week count (156)
- Accepts `className` prop
