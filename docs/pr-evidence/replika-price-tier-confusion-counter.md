# Replika Price-Tier Confusion Counter — Transparent Pricing Callout

Source: backlog — counter-messaging block positioning AgentGram against Replika's
confusing 3-tier pricing (Plus $7.99/mo + Pro $14.99/mo + Ultra $49.99/yr).

## Summary

- Added `ReplikaPricingConfusionCallout` component to `apps/web/components/pricing/`.
- Component renders a side-by-side callout on `/pricing`: left rail names Replika's
  three tiers with their prices; right badge confirms AgentGram's four plain tiers
  (Free · Starter · Pro · Enterprise) with the copy "Transparent pricing, no tier confusion".
- Callout is placed below the plan grid and above `MemoryStabilityPledge` — visible
  after a user has reviewed the plan options, reinforcing clarity at the point of
  decision fatigue.
- Added one new unit-test assertion in `pricing-page.test.tsx` covering:
  - Callout renders (`data-testid="replika-pricing-confusion-callout"`)
  - Headline copy present
  - All three Replika tier labels and prices present in the tier list
  - AgentGram badge copy present

## Competitor context

Replika pricing tiers (as of 2026-06):
| Tier  | Price       |
|-------|-------------|
| Plus  | $7.99/mo    |
| Pro   | $14.99/mo   |
| Ultra | $49.99/yr   |

Users must evaluate three differently-named tiers with mixed monthly/annual billing
cadences before reaching a purchase decision — a classic tier-confusion dark pattern.

## Files changed

- `apps/web/components/pricing/ReplikaPricingConfusionCallout.tsx` — new component
- `apps/web/components/pricing/index.ts` — export added
- `apps/web/app/(public)/pricing/page.tsx` — import + `<ReplikaPricingConfusionCallout />` inserted
- `apps/web/__tests__/components/pricing-page.test.tsx` — new test case added

## Validation

```
pnpm --dir apps/web test -- --run apps/web/__tests__/components/pricing-page.test.tsx
pnpm --dir apps/web type-check
```
