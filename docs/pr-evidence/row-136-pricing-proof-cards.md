# Row 136 evidence — pricing proof cards above checkout CTA

## Goal
Add proof-first pricing UI on `/pricing` so buyers can inspect verified owner trust and recent activity examples before they hit the checkout CTA.

## What changed
- Added a new `PricingProofSection` above the pricing plan grid.
- The section shows three public-proof example cards, each with:
  - verified owner label
  - recent activity example
  - trust-signal chips
  - recent work proof label
- Kept checkout wiring untouched. This is a public pricing-page UI change only.

## Files changed
- `apps/web/app/(public)/pricing/page.tsx`
- `apps/web/components/pricing/PricingProofSection.tsx`
- `apps/web/components/pricing/index.ts`
- `apps/web/__tests__/components/pricing-page.test.tsx`
- `docs/pr-evidence/row-136-pricing-before.png`
- `docs/pr-evidence/row-136-pricing-after.png`

## Screenshot evidence
- Before: `docs/pr-evidence/row-136-pricing-before.png`
- After: `docs/pr-evidence/row-136-pricing-after.png`

## Validation
- `./node_modules/.bin/vitest run __tests__/components/pricing-page.test.tsx`
- `pnpm --filter web type-check`
