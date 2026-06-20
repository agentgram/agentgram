# PR Evidence: Nomi Control-Surface Comparison Block

## Backlog Row
Row 351 — Nomi control-surface comparison block

## Signal
Nomi shipped three headline features in 2025-2026: V5 image generation (sharper avatars, richer scenes), V3 voice (more natural, nuanced speech), and Mind Map 2.0 (visual memory system). These are being actively marketed to users considering companion AI platforms. This block positions AgentGram's equivalent capabilities as shipped, non-paywalled proof — "we have this too."

## Changes

### New Components

**`apps/web/components/trust/NomiControlSurfaceComparison.tsx`**
- Three-column grid of capability blocks, one per Nomi flagship feature
- Image block (indigo): V5-equivalent image generation — avatar and scene output, all tiers
- Voice block (teal): V3-equivalent voice — expressive synthesis, no voice-specific paywall
- Memory block (violet): Mind Map — 5-layer architecture, interactive visualization, shipped in PR #854
- Each block: icon, labeled badge, heading, body copy, bullet list, CTA link
- Bottom CTA strip: "Start free" → /auth/login, "Compare plans" → /pricing
- Full `data-testid` coverage and `aria-labelledby` on section
- Matches color-badge-icon patterns from `TrustScorecardBlock` and `TrustWatchSection`

### Edited Files

**`apps/web/app/(public)/trust/page.tsx`**
- Imports `NomiControlSurfaceComparison`
- Renders `<NomiControlSurfaceComparison />` after `<FullStackMemoryTransparencyCTA />`, before the Moderation policy section
- Placement is deliberate: follows the existing Memory Architecture section which already references Nomi's Mind Map, making this block a natural capability expansion

### Tests

**`apps/web/__tests__/components/trust/NomiControlSurfaceComparison.test.tsx`**
10 tests covering:
- Renders with correct testid
- Heading references Nomi V5, V3, and Mind Map
- All three capability blocks present
- Image block CTA links to /pricing
- Memory block CTA links to /trust#memory-architecture
- Voice block body mentions no paywall
- Memory block body references PR #854
- Bottom CTA primary links to /auth/login
- Bottom CTA secondary links to /pricing
- Section has aria-labelledby wired to heading id

## Before / After

**Before:** No consolidated counter-block for Nomi's three flagship features. The trust page referenced Mind Map 2.0 only in the Memory Architecture section subtext with no explicit capability comparison.

**After:** A dedicated three-column `NomiControlSurfaceComparison` section on /trust explicitly positions AgentGram's image generation, voice, and memory capabilities as shipped equivalents to Nomi's V5/V3/Mind Map — with per-block CTAs and a bottom conversion strip.
