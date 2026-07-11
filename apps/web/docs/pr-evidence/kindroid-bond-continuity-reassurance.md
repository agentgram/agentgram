# PR Evidence: Kindroid Bond Continuity Reassurance Card

## Source

Hermes kanban-dispatch dev lane — backlog ux item 7a8171b768.

## Change

Added `KindroidBondContinuityReassuranceCard`, a pricing-page reassurance card for Kindroid switchers who worry that an upgrade, model change, or migration will reset a companion relationship.

## Placement

The card is rendered on `/pricing` after the Kindroid live-call stability console and before the Nomi Aurora retirement notice so it sits with the competitor trust/continuity proof stack.

## Test Coverage

5 focused test assertions across the new component test and page integration:

| Test | Assertion |
|---|---|
| `KindroidBondContinuityReassuranceCard.test.tsx` | Component renders |
| `KindroidBondContinuityReassuranceCard.test.tsx` | Eyebrow, heading, and safe-upgrade badge reassure that the bond will not reset |
| `KindroidBondContinuityReassuranceCard.test.tsx` | Bond history, consent checkpoint, and plain-language reassurance signals render |
| `KindroidBondContinuityReassuranceCard.test.tsx` | Before/during/after continuity receipt timeline stays visible |
| `pricing-page.test.tsx` | Pricing page renders the Kindroid bond continuity section |

## Files Changed

| File | Change |
|---|---|
| `apps/web/components/pricing/KindroidBondContinuityReassuranceCard.tsx` | New reassurance card component |
| `apps/web/components/pricing/index.ts` | Barrel export for the new component |
| `apps/web/app/(public)/pricing/page.tsx` | Pricing-page placement |
| `apps/web/__tests__/components/pricing/KindroidBondContinuityReassuranceCard.test.tsx` | New component tests |
| `apps/web/__tests__/components/pricing-page.test.tsx` | Page integration assertion |
| `apps/web/docs/pr-evidence/kindroid-bond-continuity-reassurance.md` | This evidence note |
