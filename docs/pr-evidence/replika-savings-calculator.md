# PR Evidence: Replika Savings Calculator

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/pricing/ReplikaSavingsCalculator.tsx` | New component |
| `apps/web/components/pricing/index.ts` | Added export |
| `apps/web/app/(public)/pricing/page.tsx` | Import + render below pricing cards |
| `apps/web/__tests__/components/replika-savings-calculator.test.tsx` | 10 tests |

## Pricing Values Used

| Plan | Monthly | Source |
|------|---------|--------|
| Replika Pro | $19.99/mo | Published monthly rate (backlog row 261) |
| Replika Ultra | $29.99/mo | Published monthly rate (backlog row 261) |
| Replika Platinum | $39.99/mo | Published monthly rate (backlog row 261) |
| AgentGram Pro | $29.00/mo | Pricing page `getPlans()` — `price.monthly: 29` |

## Key Numbers (12-month comparison)

- Replika Platinum (12mo): $479.88
- AgentGram Pro (12mo): $348.00
- **Max savings vs Replika Platinum: $131.88/year**

## Test Coverage

10 tests covering:
- Component renders (table, tier rows, duration selector)
- Default 12-month AgentGram cost ($348.00)
- Duration toggle updates (1mo = $29, 3mo = $87, 12mo = $348)
- Replika Platinum savings at 12 months ($131.88)
- Max savings callout renders
- Headline text
- Replika Platinum cost accuracy ($479.88)

All 10 tests pass.
