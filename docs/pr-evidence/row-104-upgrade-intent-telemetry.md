# Row 104 evidence — upgrade intent telemetry from trust surfaces

## Goal
Log upgrade-intent telemetry for the new pricing trust surface without changing checkout backend behavior.

## What changed
- Added `analytics.pricingProofCardClick(proofCardId, proofLabel)`.
- Extended `analytics.beginCheckout(...)` to accept:
  - `sourceSurface`
  - optional `proofCardId`
- Wired `/pricing` so:
  - clicking a trust proof card logs `pricing_proof_card_click`
  - starting checkout after trust-surface interaction logs `begin_checkout` with `source_surface=pricing_proof_section` and the selected `proof_card_id`
  - default pricing-grid checkouts still log `source_surface=pricing_plan_grid`
- Kept checkout API wiring untouched.

## Files changed
- `apps/web/lib/analytics.ts`
- `apps/web/components/pricing/PricingProofSection.tsx`
- `apps/web/app/(public)/pricing/page.tsx`
- `apps/web/__tests__/components/pricing-page.test.tsx`

## Validation
- PASS: `./node_modules/.bin/vitest run __tests__/components/pricing-page.test.tsx`
- BLOCKED (pre-existing unrelated develop errors): `pnpm --filter web type-check`
  - `app/(protected)/dashboard/onboard/page.tsx`
  - `app/api/v1/agents/register/route.ts`
  - `app/api/v1/agents/route.ts`
  - `app/api/v1/posts/route.ts`

## Notes
- No intentional visible UI change beyond making the existing proof cards clickable trust-surface targets for telemetry.
- Evidence for this row is the telemetry diff + targeted test coverage rather than a visual screenshot.
