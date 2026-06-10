# PR Evidence: C.AI Regional Free-Cap Escape CTA

## Backlog Row Description

Counter-messaging targeting users frustrated by Character.AI's 400 free messages/day cap
expansion to all global regions in 2026. AgentGram has no per-day message limit in any
region — this feature surfaces that differentiation on the landing page and /pricing.

## What Was Implemented

### 1. New component: `CAIRegionalCapEscapeCTA`

**File**: `apps/web/components/home/CAIRegionalCapEscapeCTA.tsx`

A section-level CTA banner (emerald color scheme, matching the pattern established by
`CAILorebookEscapeCTA` and `CAIChatStyleRescueCTA`) with:
- Badge: "No 400-msg/day cap"
- Heading: "No message caps, ever — unlimited replies in all regions"
- Sub-copy: references C.AI's 2026 global expansion of the 400/day limit
- Primary CTA: links to `/auth/login` — "Chat free — no daily limit"
- Secondary CTA: links to `/pricing` — "Compare plans"

### 2. Landing page (`app/(public)/page.tsx`)

`CAIRegionalCapEscapeCTA` is inserted after `CAIChatStyleRescueCTA` in the section
sequence, grouping it with the other C.AI escape CTAs.

### 3. Pricing page (`app/(public)/pricing/page.tsx`)

Two additions:
- **Hero callout** (`data-testid="pricing-no-cap-callout"`): replaces the generic
  "Tired of Character.AI's reply limits?" banner with specific counter-messaging naming
  the 400/day cap and its global 2026 expansion.
- **Hero badge** (`data-testid="pricing-unlimited-messages-badge"`): "Unlimited messages
  — no regional cap" badge added to the pledge strip below the hero CTAs.
- **Feature comparison table row**: "Unlimited messages (all regions)" row added as the
  first data row, showing ✓ across Free, Starter, and Pro columns.

### 4. Test: `__tests__/components/cai-regional-cap-escape-cta.test.tsx`

7 unit tests covering:
- Correct `data-testid` present
- Heading copy contains "No message caps", "unlimited replies", "all regions"
- Sub-copy references Character.AI, 400 cap, global expansion
- Badge copy references 400 and cap
- Primary CTA links to `/auth/login`
- Secondary CTA links to `/pricing`
- `aria-labelledby` attribute set correctly

## Evidence

### Source: Character.AI 400 messages/day cap global expansion (2026)

Character.AI introduced a 400 free messages/day limit initially in select regions, then
expanded the cap globally in 2026 as part of their monetization push toward the c.ai+
subscription tier. Users on the free tier in all regions now face the 400/day ceiling.

AgentGram imposes no per-day message limit on any tier or region, making this a concrete
differentiator for users who hit or anticipate hitting the C.AI cap.

### Test run

```
pnpm --filter web test -- cai-regional-cap-escape-cta
```

All 7 tests pass.
