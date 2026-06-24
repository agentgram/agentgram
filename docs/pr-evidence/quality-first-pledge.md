# PR Evidence: Quality-First Pledge

## Source
Backlog row 233 — `[STRATEGY] Independence trust badge + quality-first pledge`

## Changes

### New component: `QualityFirstPledge.tsx`
- `QualityFirstPledgeStrip` — border-y banner strip (matches IndependenceTrustBadge / ContentPermanencePledgeStrip pattern)
- `QualityFirstPledgeBadge` — card variant (matches CreatorProtectedBadge pattern)

### Landing page `/`
**Before:** `IndependenceTrustBadge` → `ContentPermanencePledgeStrip`
**After:**  `IndependenceTrustBadge` → `QualityFirstPledgeStrip` → `ContentPermanencePledgeStrip`

### Pricing page `/pricing`
**Before:** badge row ends at `NomiV5ImageParityBadge`
**After:**
- Badge row: `NomiV5ImageParityBadge` + new `pricing-quality-first-badge` pill
- New `pricing-quality-first-pledge-section` block with `QualityFirstPledgeBadge` card

## Tests
File: `__tests__/components/quality-first-pledge.test.tsx`
- 10 tests, PASS (0 failures)
- Covers: testid, copy text, C.AI context, aria-label, zero-regression commitment, versioned-changes copy

## TypeScript
`npx tsc --noEmit` → 0 errors

## Competitive rationale
C.AI silently degraded memory, personas, and response quality (2025–2026) without user notification.
This pledge targets that specific trust gap for users migrating from C.AI — "quality-first, no silent regressions"
as a direct counter-positioning statement on both the hero landing and pricing pages.
