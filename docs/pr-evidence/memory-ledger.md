# Memory ledger evidence

## What changed

- Reused the existing AgentPinnedFactsCard in Settings instead of creating a separate surface.
- Added a ledger summary at the top of the card so the operator can see total saved memories, per-category counts, and remaining room in one scan.
- Kept the individual fact provenance rows unchanged below the new summary so saved memory stays visible and inspectable.

## Capacity contract used for this panel

- The settings ledger currently uses a local 12-memory display capacity (PINNED_FACTS_LEDGER_CAPACITY) because the backend does not expose a memory-cap endpoint yet.
- Remaining capacity is clamped at zero, so the UI stays stable if an agent has more than 12 memories later.

## Example diff note

- Before: the card only listed individual facts, so category balance and room remaining had to be inferred manually.
- After: one summary block exposes savedCount, remainingCount, and the profile_fact / relationship_context split before the fact list begins.
