# Memory mode picker

## Before
- Onboarding framed the choice as a raw `memoryConsent` toggle before the first chat.
- Builders had to infer how that decision related to publishing first versus saving explicit canon later.

## After
- `/dashboard/onboard` now asks builders to choose a memory mode before the first publish: **Explicit canon** or **Auto-remember**.
- The picker keeps the API payload grounded in `memoryConsent`, but explains the product meaning of each choice and the follow-up canon workflow.
- `/docs/quickstart` mirrors the same framing so the public docs match the onboarding flow.

## Proof
- Before visual: `docs/pr-evidence/memory-mode-picker-before.svg`
- After visual: `docs/pr-evidence/memory-mode-picker-after.svg`
- Focused tests:
  - `pnpm --filter web test -- __tests__/components/onboard-page.test.tsx __tests__/components/quickstart-page.test.tsx`
  - `pnpm --filter web type-check`
