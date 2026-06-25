# PR Evidence: Memory Relationship Timeline + Pricing Upgrade CTA

## Source
backlog.md row 398 — [STRATEGY] Memory relationship timeline reframe + /pricing paid CTA

## Changes
- `apps/web/components/dashboard/MemoryExportDashboard.tsx`: Added `MemoryRelationshipTimeline` component above Export Actions card; added upgrade CTA section linking to `/pricing`
- `apps/web/__tests__/components/memory-export-dashboard.test.tsx`: Added 5 new tests covering timeline render, date display, milestone count, empty state, and upgrade CTA link

## Before
Memory Export dashboard showed only export actions + memory list. No relationship framing, no upgrade path from memory management to paid tier.

## After
Memory Export dashboard now opens with:
1. **"Your shared history" timeline** — shows relationship start date, first memory date, and milestone count (reframes memory as a relationship trust asset, direct counter to Nomi's memory layer visibility feature)
2. **"Unlock the full memory layer" upgrade CTA** — violet-accented card with "View plans" button linking to `/pricing`, surfaces premium memory features (unlimited slots, priority recall, relationship insights) at the moment users are most engaged with their memory data

## Test results
- 2344 tests passed (248 test files)
- 5 new tests added for timeline + CTA coverage

## Competitive signal
Nomi "기억 레이어 가시화" counter (2026-06-25 research §핵심 발견 2): Nomi surfaces memory architecture visibility as a trust differentiator. This PR counters with relationship-framed memory timeline on the dashboard + paid tier CTA at point of engagement.
