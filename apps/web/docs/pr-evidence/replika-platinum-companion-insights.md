# Replika Platinum Counter — CompanionInsightsPanel + Single-Plan Pricing Copy

## Before

- No companion insights panel existed anywhere in the product.
- The `/pricing` page had `ReplikaPricingConfusionCallout` (Plus/Pro/Ultra tiers) but no block specifically calling out Replika Platinum ($49.99/yr) or the "Read Replika's Mind" exclusive.
- No "Why one plan?" differentiator copy mentioning Platinum as the foil.

## After

### CompanionInsightsPanel (`apps/web/components/companion-insights-panel.tsx`)

New `'use client'` component with three insight sections:

- **How I see you** — 3 AI-generated observations about the user's behavior and communication style
- **What I remember most** — 3 standout memories derived from pinned facts and recurring context
- **Our connection story** — 2 narrative insights about the relationship arc and temporal patterns

Access control:
- `isPaidUser=false` → renders `PaywallGate` with an upgrade CTA to `/pricing`; paid sections are not rendered
- `isPaidUser=true` → renders all three sections with realistic mock insight items

Also exports `CompanionInsightsButton` — a small entry-point button usable on agent profile/chat surfaces.

### Wired onto Dashboard Settings (`apps/web/app/(protected)/dashboard/settings/page.tsx`)

`CompanionInsightsPanel` is rendered immediately after `AgentPinnedFactsCard` for each claimed agent. `isPaidUser` is derived from `developerPlan !== 'free'`, matching the existing plan-gating pattern used throughout the settings page.

### Pricing Page (`apps/web/app/(public)/pricing/page.tsx`)

Added `replika-platinum-single-plan-block` section directly below `ReplikaPricingConfusionCallout`:

- Calls out Replika Platinum's "$49.99/yr just to read your companion's mind" framing
- Names the AgentGram equivalent ("Companion Insights") and states it is included in every paid plan
- Uses a "1 plan / all companion features" badge as the visual counter to Platinum's third-tier confusion

## Test Results

| Suite | Tests | Status |
|---|---|---|
| `CompanionInsightsPanel` | 11 | Pass |
| `CompanionInsightsButton` | 3 | Pass |
| **Total** | **14** | **Pass** |

Full test file: `apps/web/__tests__/components/companion-insights-panel.test.tsx`

Tests cover:
- Panel container renders
- Paywall gate visible for free users
- Paid content hidden for free users
- Paid content visible for paid users
- Paywall hidden for paid users
- All three section keys render for paid users
- Section labels present for paid users
- Upgrade CTA present in paywall
- Upgrade CTA links to `/pricing`
- Agent label appears in card description
- Individual insight items render for paid users
- Button renders
- Button shows generic label for free users
- Button shows agent label for paid users
