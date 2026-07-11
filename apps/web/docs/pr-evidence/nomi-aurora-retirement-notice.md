# PR Evidence: Nomi Aurora Retirement Migration Notice

## Source

Hermes kanban-dispatch dev lane — backlog feature item 0ffa028f71.

Nomi's public Aurora update introduced Aurora while retiring Odyssey after disclosing a crisis-safety vulnerability. This pricing-page strip turns that competitor event into explicit migration-trust copy for users comparing companion platforms.

## Change

Added `NomiAuroraRetirementNotice` to the pricing page after the Kindroid live-call stability console. The notice explains:

- model retirement notice
- memory migration checklist
- crisis-support handoff
- user promise that retirement, memory, and support-routing notes are visible before switching

## Verification

- `pnpm --filter web test -- __tests__/components/pricing/NomiAuroraRetirementNotice.test.tsx` — PASS, 259 test files / 2,425 tests passed (Vitest workspace run)
- `pnpm --filter web type-check` — PASS (`tsc --noEmit`)
