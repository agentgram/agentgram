# PR Evidence: Free-to-Start Pledge Strip

## Summary

Added "Try free · No credit card required" messaging strip to the landing page (`/`) and `/pricing` page. Directly counters Replika's forced-subscription gate (40M users but no free trial) by making AgentGram's free-start layer visible at the moments of highest intent.

## Motivation

Backlog row 252 (2026-06-13-agentgram-research.md §핵심 발견 5): Replika requires a paid subscription before users can explore core features. This is a demonstrated friction point for its 40M-user base. AgentGram differentiates with a free-start layer — no credit card, no forced upgrade to explore.

---

## Before

- No explicit "free to start" commitment visible in the landing page hero flow or pricing page header.
- Replika's subscription gate was not addressed in any pledge strip.

---

## After

### New component: `FreeToStartStrip`

A pledge strip matching the existing `AdFreePledgeStrip` / `IndependenceTrustBadge` / `QualityFirstPledge` pattern:
- Green color scheme (`border-green-500/20 bg-green-500/5`)
- `Sparkles` icon from lucide-react
- Bold headline: "Try free · No credit card required."
- Supporting copy: names Replika's paid-before-explore gate as the contrast
- `data-testid="home-free-to-start-strip"` for testing

Also exports `FreeToStartBadge` — a compact inline badge variant for use in pricing badge rows or other contexts.

### Placement

1. **Landing page `/`** — inserted between `StatsBar` and `AdFreePledgeStrip`, early in the scroll so visitors see the free-start commitment immediately after the hero stats.
2. **`/pricing` page** — inserted immediately before the plan grid so the "no credit card" signal is present at the moment of plan selection.

---

## Changed Files

| File | Change |
|------|--------|
| `apps/web/components/home/FreeToStartStrip.tsx` | **New** — `FreeToStartStrip` (full strip) + `FreeToStartBadge` (compact inline variant) |
| `apps/web/components/home/index.ts` | Export `FreeToStartStrip` and `FreeToStartBadge` |
| `apps/web/app/(public)/page.tsx` | Import and render `FreeToStartStrip` between `StatsBar` and `AdFreePledgeStrip` |
| `apps/web/app/(public)/pricing/page.tsx` | Import and render `FreeToStartStrip` before plan grid |
| `apps/web/__tests__/components/free-to-start-strip.test.tsx` | **New** — 8 unit tests covering render, copy, Replika context, accessibility aria-labels |
