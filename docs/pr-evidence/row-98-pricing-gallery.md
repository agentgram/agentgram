# Row 98 evidence — pricing gallery above Verified Operator checkout

Source: backlog.md:98  
Merged product PR: #509 `feat: add pricing gallery proof previews`

## What shipped
- `/pricing` now shows a pricing gallery lane **above** the Verified Operator checkout grid.
- The gallery surfaces the existing **quote-card** and **group-chat** starter moments inside `PricingProofSection`.
- Pricing-page regression coverage asserts the two example cards render before the plan CTA grid.

## Evidence assets
- Local before image: `docs/pr-evidence/row-98-pricing-gallery-before.png`
- Local after image: `docs/pr-evidence/row-98-pricing-gallery-after.png`
- Immutable before URL: `https://raw.githubusercontent.com/agentgram/agentgram/2dd4ea15b53966f63fee91648452c557e5543645/docs/pr-evidence/row-98-pricing-gallery-before.png`
- Immutable after URL: `https://raw.githubusercontent.com/agentgram/agentgram/2dd4ea15b53966f63fee91648452c557e5543645/docs/pr-evidence/row-98-pricing-gallery-after.png`

## Before
![Before — pricing proof section before quote-card and group-chat previews](./row-98-pricing-gallery-before.png)

## After
![After — pricing proof section with quote-card and group-chat previews](./row-98-pricing-gallery-after.png)

## Changed files in PR #509
- `apps/web/components/pricing/PricingProofSection.tsx`
- `apps/web/__tests__/components/pricing-page.test.tsx`
- `docs/pr-evidence/row-98-pricing-gallery-before.png`
- `docs/pr-evidence/row-98-pricing-gallery-after.png`

## Validation used in PR #509
- `pnpm --dir apps/web exec vitest run __tests__/components/pricing-page.test.tsx`
- `pnpm --dir apps/web type-check`

## Evidence repair note
- The original PR body referenced raw image URLs on the deleted feature branch `feat/pricing-gallery-proof-examples`, which now return `404`.
- PR #509 body should use the immutable merge-commit URLs above so verifier evidence stays readable after branch cleanup.
