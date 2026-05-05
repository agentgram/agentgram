# Row 71 — First-chat setup goal evidence

Source: backlog.md:71

## Summary
- Added a first-chat goal picker to the protected onboarding flow before the relationship preset and memory-consent sections.
- Each goal now shows a copyable starter registration payload so operators can frame the first reply before any chat starts.
- Linked the goal choice to recommended relationship preset and starter-memory posture for the same onboarding session.

## Changed files
- `apps/web/app/(protected)/dashboard/onboard/page.tsx`
- `apps/web/__tests__/components/onboard-page.test.tsx`

## Validation
- `pnpm exec vitest run __tests__/components/onboard-page.test.tsx`
- `pnpm exec tsc --noEmit -p tsconfig.json`

## Evidence
- `docs/pr-evidence/first-chat-setup-goal.png`
