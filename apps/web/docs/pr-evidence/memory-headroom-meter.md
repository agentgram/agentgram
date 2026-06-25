# PR Evidence: Memory Headroom Meter

**Backlog row:** 389
**Branch:** feat/nomi-memory-headroom-meter
**Date:** 2026-06-25

## What was built

`MemoryHeadroomMeter` — a visual meter component that surfaces retained-memory headroom and recent retention gains in the memory UI.

### Files changed

| File | Change |
|------|--------|
| `apps/web/components/memory/MemoryHeadroomMeter.tsx` | New component |
| `apps/web/components/memory/index.ts` | New barrel export |
| `apps/web/app/(protected)/dashboard/memory-map/page.tsx` | Wired into memory map dashboard |
| `apps/web/__tests__/components/memory-headroom-meter.test.tsx` | 13 tests |

## Component features

- **Headroom bar** — progress bar showing current used / capacity with `aria-*` attributes for accessibility
- **Headroom %** — remaining capacity shown as a percentage label
- **Remaining slots** — absolute count of unused slots
- **Warning states** — amber badge at ≥80% usage, red "Critical" badge at ≥95%
- **Retention gains** — green badges showing `+N facts retained this week` when recent gains are present
- **Color coding** — violet (ok) → amber (warning) → destructive (critical) matching existing design system

## Integration

Wired into `memory-map/page.tsx`:
- Computes `headroomData` from `agent_memories` query (capacity = 200 facts)
- Counts facts updated in the last 7 days as weekly retention gain
- Renders `<MemoryHeadroomMeter>` above the freshness timeline in the agents view

## Tests (13 tests, ≥9 required)

1. Renders meter container
2. Renders progress bar with correct `role` and `aria-valuenow`
3. Shows correct headroom percentage
4. Shows remaining slots count
5. Shows used percentage label
6. No warning badge in normal state (<80%)
7. Shows warning badge at ≥80% usage
8. Shows critical badge at ≥95% usage
9. Renders retention gains when provided
10. Renders multiple retention gains
11. Does not render gains section when empty
12. Shows used/capacity label in bar section
13. Clamps bar fill to 100% when used exceeds capacity
