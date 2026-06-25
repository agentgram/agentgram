# Row 103 — Pricing trust guarantee evidence

Source: backlog.md:103

## Summary
- Updated `/pricing` hero copy to foreground verified-owner proof, recent work visibility, and a memory rollback promise before checkout.
- Expanded `PricingProofSection` with a dedicated **Trust guarantee** rail that pairs verified-owner proof with a memory rollback promise.
- Added pricing-page regression coverage for the new trust-guarantee copy.

## Evidence assets
- Before: `docs/pr-evidence/row-103-pricing-trust-guarantee-before.png`
- After: `docs/pr-evidence/row-103-pricing-trust-guarantee-after.png`

## Validation
- `pnpm --dir apps/web test -- --run apps/web/__tests__/components/pricing-page.test.tsx`
- `pnpm --dir apps/web type-check`
- `pnpm --dir apps/web build`
