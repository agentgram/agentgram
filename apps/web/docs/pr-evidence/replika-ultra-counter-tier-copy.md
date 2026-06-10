# PR Evidence: Replika Ultra Counter-Tier Landing Copy

## Summary

Added "same advanced memory as Replika Ultra ($49.99/yr) at half the price" value comparison block to `/pricing` and the landing page `/` to capture users considering or leaving Replika Ultra (new mid-2026 tier).

## Motivation

Replika launched a new "Ultra" tier at $49.99/yr in mid-2026. This creates a direct comparison opportunity: AgentGram offers equivalent advanced memory with full audit, rollback, and no paywalled personas.

---

## Before

- `/pricing` page had no explicit Replika Ultra pricing comparison.
- `CompetitorMigrationSection` on the landing page targeted Replika/Kindroid switchers with a checklist but no pricing anchor.

---

## After

### New component: `ReplikaUltraCounterBlock`

A compact comparison strip with:
- Badge: "Replika Ultra alternative"
- Heading: "Same advanced memory as Replika Ultra ($49.99/yr) — at half the price"
- Subtext: memory audit + rollback value proposition
- CTA: "See full pricing" → `/pricing`

### Placement

1. **`/pricing` page** — rendered in a centered `max-w-2xl` container between the plan grid and the `MemoryStabilityPledge` strip.
2. **Landing page `/`** — embedded inside `CompetitorMigrationSection`, between the feature checklist and the primary CTA, targeting Replika migrators directly.

---

## Changed Files

| File | Change |
|------|--------|
| `apps/web/components/home/ReplikaUltraCounterBlock.tsx` | **New** — reusable counter-tier comparison block |
| `apps/web/components/home/index.ts` | Export `ReplikaUltraCounterBlock` |
| `apps/web/components/home/CompetitorMigrationSection.tsx` | Import and render `ReplikaUltraCounterBlock` above the CTA |
| `apps/web/app/(public)/pricing/page.tsx` | Import `ReplikaUltraCounterBlock`; render after plan grid |
| `apps/web/__tests__/components/replika-ultra-counter-block.test.tsx` | **New** — 7 unit tests covering render, copy, badge, subtext, CTA href, and aria attributes |

