# PR Evidence: C.AI c.ai+ Memory Free Counter

**Backlog row:** 213
**Branch:** feat/cai-memory-free-counter
**Date:** 2026-06-10

## What was built

Counter-positioning against Character.AI's 2026 decision to gate Story Memory, Facts, and Memory Usage tracking behind the c.ai+ paid subscription.

## Files changed

### New
- `apps/web/components/home/CaiMemoryFreeCounterBadge.tsx` — Full CTA section component with emerald color scheme, memory type chip list, badge label, and dual CTAs
- `apps/web/__tests__/components/cai-memory-free-counter-badge.test.tsx` — 7 tests covering section rendering, heading content, sub-copy, badge label, memory type chips, CTA links, and aria attributes

### Modified
- `apps/web/components/home/index.ts` — Added export for `CaiMemoryFreeCounterBadge`
- `apps/web/app/(public)/pricing/page.tsx` — Added `Brain` import, memory-free hero badge (`data-testid="pricing-memory-free-badge"`), and `<CaiMemoryFreeCounterBadge />` section after `CAIChatStyleRescueCTA`
- `apps/web/app/(protected)/dashboard/onboard/page.tsx` — Added `Brain` import and inline callout (`data-testid="cai-memory-free-onboarding-callout"`) after the memory-mode-monetization-compare block

## Before / After

**Before:** No counter-messaging against Character.AI's memory paywall gating.

**After:**
- Pricing page hero shows "All memory types free — no c.ai+ paywall" badge
- Pricing page includes `CaiMemoryFreeCounterBadge` section between `CAIChatStyleRescueCTA` and `MemoryGuaranteeLandingSection`
- Onboarding memory-mode section shows an inline callout explaining that Story Memory, Facts, and Memory Usage are free on all AgentGram plans

## Competitor context

Character.AI introduced c.ai+ in 2026, gating:
- Story Memory (persistent narrative context)
- Facts (explicit character/user facts)
- Memory Usage tracking (visibility into what's remembered)

AgentGram provides all three on every plan, including the free tier.
