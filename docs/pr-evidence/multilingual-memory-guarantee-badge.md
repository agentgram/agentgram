# PR Evidence: Multilingual Memory Guarantee Badge

**Backlog row:** 266
**Branch:** feat/multilingual-memory-guarantee-badge
**Date:** 2026-06-14

## Feature Description

Adds a `MultilingualMemoryBadge` component that surfaces AgentGram's multilingual memory accuracy as a competitive differentiator against Nomi.

**Competitive context:** Nomi's App Store reviews (2026, 4.6/5, 5,000+ reviews) cite multilingual and cultural-nuance memory errors as the most-common complaint. This badge explicitly positions AgentGram as the solution.

## Files Changed

### New files

| File | Purpose |
|------|---------|
| `apps/web/components/agents/MultilingualMemoryBadge.tsx` | New reusable badge component |
| `apps/web/__tests__/components/multilingual-memory-badge.test.tsx` | 8 unit tests |
| `docs/pr-evidence/multilingual-memory-guarantee-badge.md` | This file |

### Modified files

| File | Change |
|------|--------|
| `apps/web/app/(public)/pricing/page.tsx` | Import + hero badge strip + full section block |
| `apps/web/components/dashboard/MemoryExportDashboard.tsx` | Import + badge under page header |

## Component: MultilingualMemoryBadge

```tsx
// apps/web/components/agents/MultilingualMemoryBadge.tsx
<Badge
  data-testid="multilingual-memory-badge"
  title="Memory stored and recalled accurately in any language — counter to Nomi 2026 App Store most-cited complaint"
>
  <Globe /> Memory in any language — stored & recalled accurately
</Badge>
```

- Styled blue (`border-blue-500/20 bg-blue-500/10`) to visually distinguish it from existing violet (Nomi V5) and emerald (memory-free) badges.
- Accepts optional `className` for layout overrides.

## Placement on /pricing

1. **Hero badge strip** — inline with `NomiV5ImageParityBadge` and other competitive badges.
2. **Dedicated section block** (`data-testid="pricing-multilingual-memory-section"`) — between the Visual Memory section and `FreeToStartStrip`, with copy explaining Nomi's App Store complaint and AgentGram's answer.

## Placement on Memory Dashboard

Badge appears in the `MemoryExportDashboard` header area (`data-testid="memory-export-multilingual-badge"`), directly under the page title and description, connecting the dashboard UX to the marketing claim.

## Test Coverage (8 tests)

| # | Test |
|---|------|
| 1 | Renders with correct `data-testid` |
| 2 | Displays "Memory in any language" text |
| 3 | Displays "stored & recalled accurately" text |
| 4 | `title` attribute references "Nomi 2026 App Store" |
| 5 | `title` attribute references "any language" |
| 6 | Accepts and applies optional `className` prop |
| 7 | Globe SVG icon is rendered |
| 8 | Default styling includes `bg-blue-500/10` class |

## Auth-only Proof

N/A — badge is visible on the public `/pricing` page (no auth required).
