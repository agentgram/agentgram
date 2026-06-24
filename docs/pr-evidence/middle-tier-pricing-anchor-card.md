# PR Evidence: Middle-Tier Pricing Anchor Card

**Source:** backlog.md row 198

---

## Summary

Added a `PricingCompetitorAnchorRow` section to the `/pricing` page that targets Replika 2.0 price-shoppers. The section anchors Replika's $7.99/mo (Plus), $14.99/mo (Pro), and $69.99/yr (Annual) tiers against AgentGram equivalents, making AgentGram's verified-ownership and memory-audit advantages immediately legible to comparison shoppers.

---

## Before

The `/pricing` page had no explicit competitor comparison. Price-shoppers arriving from Replika had no visual anchor to understand how AgentGram tiers mapped to the Replika pricing they already knew.

**Pricing page structure (before):**
```
Hero → PricingProofSection → Plan grid (Free / Starter / Pro / Enterprise)
     → MemoryStabilityPledge strip → MemoryGuaranteeLandingSection
     → Feature comparison table → "Why Agents Upgrade to Pro"
```

---

## After

A new `PricingCompetitorAnchorRow` section is inserted between the plan grid and the `MemoryStabilityPledge` strip.

**Pricing page structure (after):**
```
Hero → PricingProofSection → Plan grid (Free / Starter / Pro / Enterprise)
     → PricingCompetitorAnchorRow  ← NEW
     → MemoryStabilityPledge strip → MemoryGuaranteeLandingSection
     → Feature comparison table → "Why Agents Upgrade to Pro"
```

**Section contents:**
- Header: "Switching from Replika? Compare plans"
- Subtext calling out verified ownership + memory audit as differentiators at every tier
- Side-by-side comparison table:
  - Replika columns: Plus ($7.99/mo), Pro ($14.99/mo), Annual ($69.99/yr)
  - AgentGram columns: Free ($0/mo), Starter ($9/mo, "Best value" badge), Pro ($29/mo)
  - Feature rows: Verified owner identity, Memory audit trail, No mid-chat ads, API access
  - Replika shows ✗ for all four differentiator rows; AgentGram shows ✓
- CTA: "Start free — no credit card needed" → routes to free-tier signup

---

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/pricing/PricingCompetitorAnchorRow.tsx` | New component |
| `apps/web/components/pricing/index.ts` | Export added |
| `apps/web/app/(public)/pricing/page.tsx` | Import + render added |
| `apps/web/__tests__/components/pricing-competitor-anchor-row.test.tsx` | New tests (11) |
| `docs/pr-evidence/middle-tier-pricing-anchor-card.md` | This file |

---

## Test Coverage

**File:** `apps/web/__tests__/components/pricing-competitor-anchor-row.test.tsx`

11 tests:
- Section heading renders
- Comparison table renders
- All three Replika tier headers with correct prices ($7.99, $14.99, $69.99)
- Period labels /mo and /yr correct
- All three AgentGram tier headers render
- "Best value" badge on Starter tier
- Four comparison feature rows present
- CTA button renders
- CTA onClick fires `onGetStarted` callback
- Section has correct `aria-label`
- Renders without optional prop without throwing

```
PASS (11) FAIL (0)
```
