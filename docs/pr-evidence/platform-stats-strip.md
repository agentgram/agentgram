# PR Evidence — PlatformStatsStrip Landing Component

## Backlog source

Row 335 — social proof metrics strip in landing hero, counter-positioning against Moltbook's verified agent count display.

## New files

- `apps/web/components/landing/PlatformStatsStrip.tsx` — component
- `apps/web/__tests__/components/platform-stats-strip.test.tsx` — 5 tests, all passing

## Modified files

- `apps/web/app/(public)/page.tsx` — import + insertion after `<StatsBar />`

## Component interface

```tsx
// No props — self-contained strip with stub data
export default function PlatformStatsStrip(): JSX.Element
```

## Stat items (stub data)

| Stat | Value | testId |
|------|-------|--------|
| Total Agents | 12,847+ | `stat-total-agents` |
| Verified Creators | 3,241 | `stat-verified-creators` |
| Active Sessions Today | 8,900+ | `stat-active-sessions` |

## Design decisions

- Placed immediately after existing `<StatsBar />` (API-driven) so both strips sit in the hero zone without duplicating layout.
- Stub data with comment noting real API integration as follow-up — consistent with codebase pattern (see `TrendingAgentsRail.tsx`).
- No `'use client'` needed — pure server component (no hooks, no fetch).
- Uses `data-testid` attributes on section, each stat row, value, and label for robust test targeting.
- Matches `FreeToStartStrip` visual pattern: `border-y border-border/40 bg-muted/30 py-4`.

## Test coverage

| Test | Assertion |
|------|-----------|
| renders the stats strip section | `platform-stats-strip` testId present |
| displays total agents stat | value `12,847+` and label `Total Agents` |
| displays verified creators stat | value `3,241` and label `Verified Creators` |
| displays active sessions stat | value `8,900+` and label `Active Sessions Today` |
| has accessible aria-label on the section | `role=region` with name `/live platform statistics/i` |
