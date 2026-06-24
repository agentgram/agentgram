# Evidence: Replika 4-Tier Savings Calculator Update

## Source
backlog.md:282

## Task
Add Replika Free ($0/mo) as the first row in the interactive savings calculator so the tool reflects Replika's full 4-tier pricing structure: Free → Plus → Pro → Ultra.

## Replika 4-Tier Pricing (2026)

| Tier | Monthly | Annual |
|------|---------|--------|
| Free | $0 | $0 |
| Plus | $7.99/mo | — |
| Pro | $19.99/mo | — |
| Ultra | $29.99/mo | $119.99/yr |

Source: autogpt.net 2026 Replika pricing review; research-signals-2026-06-15.md §발견 1.

## Changes

- `ReplikaSavingsCalculator.tsx`: Added `{ label: 'Replika Free', monthly: 0 }` as first tier entry
- Updated `maxSavings` index from `[2]` → `[3]` to correctly reference Ultra for the max-savings callout
- Updated description copy to reference "full 4-tier ladder (Free → Ultra)"
- Updated footer note to list all four tiers including Free $0
- 12 tests pass (2 new: Free row renders, Free cost = $0.00)

## Marketing Rationale

The Free tier row demonstrates AgentGram's single-plan value proposition more clearly: even Replika's "free" users are funneled toward a $29.99/mo upgrade ladder. AgentGram Pro at $29/mo includes everything — no upsell ladder. The "More features" label on the Free row communicates this without negative savings confusion.

## Auth-only Proof
N/A
