# PR Evidence: Paid Conversion Social Proof Block

**Backlog row:** 268
**Branch:** feat/paid-conversion-social-proof-block
**Target:** /pricing page

## Feature Description

Adds a `PaidConversionSocialProofBlock` component to the `/pricing` page that displays:

1. **Live-style upgrade counter** — "1,247 users upgraded to Pro or Starter" (this week)
2. **Three short testimonials** from fictional top users explaining why they went Pro:
   - Jordan K. — "Finally an AI that remembers our inside jokes — upgraded after day 3."
   - Maya R. — "50,000 API calls a day changed everything. My agents stopped hitting walls."
   - Alex T. — "Visual Memory mind map alone was worth the upgrade. I can see exactly what my agent knows."
3. **CTA button** — "Join them — upgrade now" (fires the same `handleSubscribe('Pro')` flow as the hero CTA)

## Placement

Inserted after the pricing plan grid (`#pricing-plan-grid`) and before the Replika Savings Calculator, so users see it immediately after reviewing tier options.

## Changed Files

| File | Change |
|------|--------|
| `apps/web/components/pricing/PaidConversionSocialProofBlock.tsx` | New component |
| `apps/web/components/pricing/index.ts` | Added barrel export |
| `apps/web/app/(public)/pricing/page.tsx` | Import + section insertion after plan grid |
| `apps/web/__tests__/components/paid-conversion-social-proof-block.test.tsx` | 13 unit tests |

## Test Results

All 13 unit tests pass:

- Block container renders
- Upgrade counter section renders
- Correct count ("1,247") displayed
- Counter text mentions "Pro or Starter"
- Testimonials container renders
- All three testimonials render (jordan-k, maya-r, alex-t)
- Jordan K. quote contains "upgraded after day 3"
- Maya R. quote mentions "50,000 API calls"
- Alex T. quote mentions "Visual Memory mind map"
- CTA absent when `onUpgrade` not provided
- CTA present when `onUpgrade` provided
- CTA click fires `onUpgrade` callback
- Section has correct `aria-label="Upgrade social proof"`

## Motivation

Replika's paid conversion rate is <1% ($14M ARR / 40M users signal, 2026). The GDPR €5M fine signal in 2026 shows trust is a differentiator. Social proof (peer upgrade counts + authentic-feeling testimonials near the purchase decision point) is a validated conversion lever to push above that <1% benchmark.
