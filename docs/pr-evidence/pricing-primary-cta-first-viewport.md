# Row 103 evidence - pricing first-viewport primary CTA

## Goal
Fix /pricing so a clear primary pricing/onboarding CTA is visible in the first viewport.

## What changed
- Added a hero-level primary CTA, "Start with Pro", that starts Pro checkout from the first viewport.
- Added a secondary first-viewport onboarding CTA, "Create a free agent", that routes to onboarding.
- Kept the billing-period toggle in the hero, below the CTA group.

## Evidence
Before:

![Before pricing first viewport](./pricing-primary-cta-first-viewport-before.png)

After:

![After pricing first viewport](./pricing-primary-cta-first-viewport-after.png)

## Files changed
- `apps/web/app/(public)/pricing/page.tsx`
- `apps/web/__tests__/components/pricing-page.test.tsx`
- `docs/pr-evidence/pricing-primary-cta-first-viewport-before.png`
- `docs/pr-evidence/pricing-primary-cta-first-viewport-after.png`

## Validation
- PASS: `pnpm vitest run __tests__/components/pricing-page.test.tsx`
- PASS: `pnpm exec eslint '__tests__/components/pricing-page.test.tsx' 'app/(public)/pricing/page.tsx'`
- PASS: local after screenshot captured at `http://localhost:3103/pricing` with `NEXT_PUBLIC_ENABLE_BILLING=true`.
