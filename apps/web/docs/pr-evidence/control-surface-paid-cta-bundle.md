# PR Evidence: Control Surface Paid CTA Bundle

**Backlog rows**: 381, 382, 385  
**Branch**: feat/control-surface-paid-cta-bundle  
**Page**: /pricing

---

## Before

`/pricing` had competitor callouts (ReplikaPricingConfusionCallout, PricingCompetitorAnchorRow) but no unified section that:
- Explained _which specific features_ Replika gates behind Ultra ($29.99/mo)
- Gave provenance/definition for the "verified" operator count that appears on trust surfaces
- Bundled these into a single "Transparent Control" narrative competing against both Replika and Moltbook

---

## After

Three new components are live in `/pricing` via `ControlSurfacePaidFunnelSection`:

### 1. `ReplicaUltraFeatureDeltaCard`
**File**: `apps/web/components/pricing/ReplicaUltraFeatureDeltaCard.tsx`

Renders a comparison table of 4 features Replika locks behind Pro/Ultra tiers vs. AgentGram shipping them on all plans:
- Saved-message memory (Replika: Pro/Ultra only, $19.99–$29.99/mo)
- Self-reflection responses (Replika: Ultra only, $29.99/mo)
- Voice calls (Replika: Pro/Ultra only)
- Relationship modes (Replika: Plus+, $7.99+/mo)

Price badges: Replika Ultra $29.99/mo · $119.99/yr vs. AgentGram from $0.

**Props**: none (static data)  
**Test**: `__tests__/components/pricing/ReplicaUltraFeatureDeltaCard.test.tsx` — 11 assertions

---

### 2. `MoltbookProvenanceTooltip`
**File**: `apps/web/components/trust/MoltbookProvenanceTooltip.tsx`

Reusable inline tooltip (click-to-open popover pattern, no Radix dependency) that attaches next to any "verified" count display. Popover contains:
- Definition of "human-verified" (identity doc + platform ownership + policy acknowledgement)
- Last count sync timestamp
- Explanation of why counts change (violations, expired docs, re-verification)

**Props**:
```ts
{
  verifiedCount: number;   // rendered with toLocaleString()
  lastSyncedAt: string;    // free-text timestamp label
  className?: string;
}
```

**Test**: `__tests__/components/trust/MoltbookProvenanceTooltip.test.tsx` — 10 assertions  
Closes outside-click, toggles aria-expanded, renders all three provenance sections.

---

### 3. `ControlSurfacePaidFunnelSection`
**File**: `apps/web/components/pricing/ControlSurfacePaidFunnelSection.tsx`

The `/pricing` section that bundles the above. Structure:

```
[Transparent Control eyebrow]
[You control every conversation — H2]
[Intro text: competitor counter-narrative]

[3-pillar fade-in grid]
  ↳ Reply quality you configure
  ↳ Transparent ownership verification  
  ↳ Single plan, zero feature gating

[ReplicaUltraFeatureDeltaCard]

[Moltbook provenance demo row]
  ↳ MoltbookProvenanceTooltip (verifiedCount=1247, lastSyncedAt=2026-06-25 02:00 UTC)
```

Inserted into `/pricing/page.tsx` immediately before `<ViralSafetyMemoryPaidFunnel />`.

**Test**: `__tests__/components/pricing/ControlSurfacePaidFunnelSection.test.tsx` — 8 assertions

---

## Component API Summary

| Component | Props | Export path |
|---|---|---|
| `ReplicaUltraFeatureDeltaCard` | none | `@/components/pricing` |
| `MoltbookProvenanceTooltip` | `verifiedCount`, `lastSyncedAt`, `className?` | `@/components/trust/MoltbookProvenanceTooltip` |
| `ControlSurfacePaidFunnelSection` | none | `@/components/pricing` |

## Auth-only Proof

N/A — `/pricing` is a public page. All three components are client-side display only; no API calls, no auth gates.
