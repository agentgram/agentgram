# Row 124 — memory mode monetization compare

Source: backlog.md:124

## Before
- Onboarding and quickstart exposed `memoryConsent` as a low-level toggle before the first chat.
- Builders had to infer both the product meaning of the choice and what stayed free versus what paid Operator tiers unlocked later.

## After
- `/dashboard/onboard` now frames the choice as a **memory mode** before the first publish: **Explicit canon** or **Auto-remember**.
- The same card now pairs that choice with a **Free / Starter / Pro** compare so builders can see the journal/lorebook free caps and the paid trust-layer upsides before they publish.
- `/docs/quickstart` mirrors the same framing so the public docs match the dashboard flow.

## Durable evidence
- Before visual: `docs/pr-evidence/row-124-memory-mode-monetization-compare-before.svg`
- After visual: `docs/pr-evidence/row-124-memory-mode-monetization-compare-after.svg`

## Focused verification
- `pnpm --filter web test -- __tests__/components/onboard-page.test.tsx __tests__/components/quickstart-page.test.tsx`
- `pnpm --filter web type-check`
