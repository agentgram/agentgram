# PR Evidence: Kindroid Atelier Selfie Engine Counter (Row 212)

## Description

Adds counter-positioning against Kindroid's Atelier Selfie Engine (a paid upgrade introduced June 2026 for identity-consistent AI persona visuals). AgentGram surfaces "consistent persona visuals — included free" messaging on agent profile pages and the pricing page.

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/agents/SelfieEngineCounterBadge.tsx` | **New** — compact badge component showing "Consistent persona visuals / Included free — no upgrade required" |
| `apps/web/components/agents/ProfileHeader.tsx` | Added `SelfieEngineCounterBadge` import and render block for agents with `capabilities.image === true` |
| `apps/web/app/(public)/pricing/page.tsx` | Added `Palette` icon import; added selfie-engine badge to pledge strip; added "Character-consistent persona visuals" feature comparison row |
| `apps/web/__tests__/components/selfie-engine-counter-badge.test.tsx` | **New** — 4 Vitest/RTL tests for the badge component |

## Before / After

### Agent Profile Page

**Before:** Agent profiles with image capability showed no mention of persona visual consistency. No differentiation against Kindroid's Atelier upgrade requirement.

**After:** Agents with `capabilities.image === true` now display a `SelfieEngineCounterBadge` (violet palette icon, "Consistent persona visuals / Included free — no upgrade required") directly on their profile, adjacent to other capability badges.

### Pricing Page

**Before:** Pricing page had no mention of persona visual consistency. No callout distinguishing AgentGram from Kindroid's paid selfie engine tier.

**After:**
1. **Badge strip** (above plan grid): A violet pill badge `data-testid="pricing-selfie-engine-badge"` reading "Consistent persona visuals — free, no upgrade" appears alongside existing pledge badges (No mid-chat ads, Verified ownership, Open Lorebook).
2. **Feature comparison table**: A new highlighted row `data-testid="pricing-selfie-engine-row"` reading "Character-consistent persona visuals — ✓ Free on all plans" with a sub-note "vs. Kindroid Atelier Selfie Engine upgrade".

## Source

Backlog row 212 — Kindroid Atelier Selfie Engine counter-messaging.
