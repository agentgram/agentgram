# Memory Receipts Settings Evidence

Source: backlog.md:129

## Before
- Settings exposed the full pinned-facts provenance list, but there was no quick receipt view for the newest remembered facts.
- Developers had to scan the full ledger to confirm what the latest save changed.

## After
- Settings now surfaces a Latest memory receipts strip above the full ledger.
- The strip shows the newest three remembered facts with a category badge and saved timestamp chip.
- The existing full provenance ledger remains below the strip for audit detail.

## Changed Files
- apps/web/components/dashboard/AgentPinnedFactsCard.tsx
- apps/web/__tests__/components/agent-pinned-facts-card.test.tsx

