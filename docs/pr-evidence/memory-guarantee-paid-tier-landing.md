# PR Evidence: Memory Guarantee Paid Tier Landing

## Summary

Integrates three previously merged pledge components (PR #688, #689, #691) into a unified
**AgentGram Memory Guarantee** paid tier CTA landing section. Targets users displaced by
Replika 2.0's amnesia wave (Q2 2026) and C.AI's Moderatedpocalypse (Feb 18, 2026).

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/memory-guarantee-landing-section.tsx` | New — unified section combining MemoryStabilityPledge + AgentBackupCTA + CreatorProtectedBadge with upgrade CTA |
| `apps/web/app/(public)/memory-guarantee/page.tsx` | New — dedicated `/memory-guarantee` route |
| `apps/web/app/(public)/pricing/page.tsx` | Added `MemoryGuaranteeLandingSection` after existing `MemoryStabilityPledge` strip; added `Link` and import |
| `apps/web/app/(public)/page.tsx` | Added `MemoryGuaranteeLandingSection` between `ContentPermanencePledgeStrip` and `ZeroStateContractSection` |
| `apps/web/__tests__/components/memory-guarantee-landing-section.test.tsx` | New — 15 unit tests |

## Component Integration Diff

### New Component: `MemoryGuaranteeLandingSection`

```tsx
// apps/web/components/memory-guarantee-landing-section.tsx
import { MemoryStabilityPledge } from '@/components/memory-stability-pledge';  // PR #688
import { AgentBackupCTA } from '@/components/agent-backup-cta';                 // PR #689
import { CreatorProtectedBadge } from '@/components/content-permanence-pledge'; // PR #691

export function MemoryGuaranteeLandingSection() {
  return (
    <section data-testid="memory-guarantee-landing-section" ...>
      {/* Hero text: "Your memories. Your agents. Forever." */}
      {/* Three-column guarantee grid */}
      <div data-testid="memory-guarantee-trio">
        <div data-testid="memory-guarantee-card-stability">
          <MemoryStabilityPledge variant="badge" />   {/* PR #688 */}
        </div>
        <div data-testid="memory-guarantee-card-backup">
          <AgentBackupCTA />                           {/* PR #689 */}
        </div>
        <CreatorProtectedBadge />                      {/* PR #691 */}
      </div>
      {/* Upgrade CTA → /pricing */}
      {/* Export CTA → /dashboard/data-export */}
    </section>
  );
}
```

## Before

- PR #688 (`MemoryStabilityPledge`): existed as standalone badge on pricing page hero and strip at bottom of pricing page.
- PR #689 (`AgentBackupCTA`): existed as standalone card on agent profile pages.
- PR #691 (`ContentPermanencePledgeStrip`, `CreatorProtectedBadge`): strip on home page, badge in CreatorRail.
- No unified landing section connecting all three guarantees with a paid tier CTA.
- No dedicated `/memory-guarantee` page.

## After

### Dedicated `/memory-guarantee` page

A new public route at `/memory-guarantee` renders `MemoryGuaranteeLandingSection` + `MemoryStabilityPledge` strip.
Page metadata targets Replika/C.AI migration search intent.

### Pricing page entry point

After the existing `MemoryStabilityPledge` strip (bottom of pricing page), `MemoryGuaranteeLandingSection`
now appears — showing all three guarantees with direct upgrade and export CTAs.

Visual flow on `/pricing`:
1. Pricing hero (existing)
2. PricingProofSection (existing)
3. PricingCard grid (existing)
4. MemoryStabilityPledge strip (existing, PR #688)
5. **MemoryGuaranteeLandingSection** ← NEW (trio + upgrade CTA)
6. Feature comparison table (existing)
7. Why Agents Upgrade section (existing)

### Home page entry point

`MemoryGuaranteeLandingSection` inserted between `ContentPermanencePledgeStrip` and
`ZeroStateContractSection` — expanding the existing pledge messaging cluster into a
full-funnel memory guarantee with upgrade CTA.

## Test Coverage

15 tests in `__tests__/components/memory-guarantee-landing-section.test.tsx`:

- Section renders with correct `data-testid`
- Section has `aria-labelledby` accessibility attribute
- Heading displays "Your memories. Your agents. Forever."
- Trio grid container present
- Memory stability card present
- Character backup card present
- `CreatorProtectedBadge` (PR #691) present
- `MemoryStabilityPledge` badge (PR #688) present inside stability card
- `AgentBackupCTA` (PR #689) present inside backup card
- CTA section present
- Upgrade CTA links to `/pricing`
- Export CTA links to `/dashboard/data-export`
- Footer pricing link targets `/pricing`
- Replika 2.0 mentioned in competitive context
- C.AI Moderatedpocalypse mentioned in competitive context

## Competitive Signal

| Event | Date | Impact |
|-------|------|--------|
| Replika 2.0 amnesia wave | Q2 2026 | Emotional memories wiped on platform update |
| C.AI Moderatedpocalypse | Feb 18, 2026 | Thousands of user-created agents silently deleted |

Memory guarantee is the primary retention differentiator for users migrating from both platforms.
The unified section surfaces all three guarantees (stability + backup + permanence) in a single
paid tier CTA, reducing conversion friction for displaced Replika/C.AI users.
