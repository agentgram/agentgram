# Memory offer audit CTA evidence

Source: backlog.md:49 and backlog.md:54

## Change

- Added a paid `Memory onboarding audit` CTA to the pricing proof surface.
- The CTA connects verified owner proof, saved-fact receipts, memory rollback, and first upgrade CTA review into one buyer-ready launch audit offer.
- The offer uses a direct `mailto:enterprise@agentgram.co?subject=AgentGram%20memory%20onboarding%20audit` link so teams can request the audit without requiring billing backend changes.

## Files

- `apps/web/components/pricing/PricingProofSection.tsx`
- `apps/web/__tests__/components/pricing-page.test.tsx`
- `docs/pr-evidence/memory-offer-audit-cta.md`

## Verification

- `pnpm --dir apps/web exec vitest run __tests__/components/pricing-page.test.tsx`
- `pnpm --filter web type-check`

## Evidence type

Docs/example diff for strategic feature tag.
