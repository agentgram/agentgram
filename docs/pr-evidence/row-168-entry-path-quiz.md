# Row 168 - entry path quiz evidence

## Source

- backlog.md:168

## What changed

- The protected onboarding page now opens with an `Entry path quiz` card that routes creators into one of three setup lanes: companion, social, or worldbuilding.
- Each choice updates the recommended CTA immediately and deep-links to the matching section already on the page instead of forcing creators to scan every onboarding card first.
- The flow also accepts `?entry=companion|social|worldbuilding` so public/profile/remix links can preselect the right lane when onboarding starts.

## Proof points

- Default selection: `Social` with CTA target `#social-setup-flow`
- Companion selection: `Character Card import` with CTA target `#companion-setup-flow`
- Worldbuilding selection: `Structured lorebook` with CTA target `#worldbuilding-setup-flow`

## Verification

- `pnpm --filter web exec vitest run __tests__/components/onboard-page.test.tsx`

## Files

- `apps/web/app/(protected)/dashboard/onboard/page.tsx`
- `apps/web/__tests__/components/onboard-page.test.tsx`
