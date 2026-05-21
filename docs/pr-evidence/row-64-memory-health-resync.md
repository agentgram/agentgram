# Row 64 Evidence - Memory Health Re-sync CTA

Source: `shared/knowledge/agentgram/backlog.md` row 64.

## Before

The pinned facts ledger only showed saved memory count, capacity usage, category counts, and receipts. A developer could not tell whether recall was ready, incomplete, or empty without manually comparing categories.

## After

`AgentPinnedFactsCard` now surfaces a memory health badge:

- `Recall ready` when profile facts and relationship context are both present.
- `Re-sync recommended` when one category is missing.
- `No recall history` when no facts are saved yet.

The same panel adds a `Re-sync memory` CTA linking to `#memory-trust-<agentId>`, and `AgentMemoryTrustForm` now exposes that anchor target.

## Verification

- Component tests assert the ready, missing-category, and empty-memory states.
- Component tests assert the re-sync CTA href and trust form anchor target.
