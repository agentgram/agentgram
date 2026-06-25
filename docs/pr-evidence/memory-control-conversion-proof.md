# Memory Control Conversion Proof

## Summary

Connects the verified memory event log (pinned facts panel) to a paid upgrade
CTA so users see their saved facts — then are prompted to unlock premium memory.
Closes the KPI loop between memory engagement and paid conversion.

## What Was Added

### New component: `MemoryConversionCTA`

**File**: `apps/web/components/memory-conversion-cta.tsx`

A subtle banner/card that appears after the fact review log inside
`AgentPinnedFactsCard`. It surfaces:

- **Headline**: "{AgentLabel} remembers {N} facts about you" (dynamic count)
- **Primary CTA**: "Unlock Premium Memory" → `/pricing`
- **Secondary CTA**: "View all memories" → `/dashboard/settings#memory`
- **Test ID**: `memory-conversion-cta`

### Integration point

**File**: `apps/web/components/dashboard/AgentPinnedFactsCard.tsx`

`MemoryConversionCTA` is rendered between the `fact-review-log` section and
the `pinned-facts-receipts` section when `facts.length > 0`.

```
[fact-review-log]             ← existing: lists facts to audit
[MemoryConversionCTA]         ← NEW: upgrade prompt with fact count
[pinned-facts-receipts]       ← existing: recent memory receipts
[Full memory ledger]          ← existing: full editable ledger
```

## Component Structure Diff

### Before (AgentPinnedFactsCard.tsx, abbreviated)

```tsx
{facts.length > 0 && (
  <>
    <div data-testid="fact-review-log">...</div>
    <div data-testid="pinned-facts-receipts">...</div>
    <div className="space-y-3">Full memory ledger...</div>
  </>
)}
```

### After

```tsx
{facts.length > 0 && (
  <>
    <div data-testid="fact-review-log">...</div>
    <MemoryConversionCTA factCount={facts.length} agentLabel={settings.agentLabel} />
    <div data-testid="pinned-facts-receipts">...</div>
    <div className="space-y-3">Full memory ledger...</div>
  </>
)}
```

## KPI Measurement

| Signal | How to measure |
|---|---|
| **Impression** | Page views of `/dashboard/settings` with `fact-review-log` visible |
| **Click — upgrade** | Clicks on `data-testid="memory-conversion-cta-upgrade"` (href: `/pricing`) |
| **Click — view all** | Clicks on `data-testid="memory-conversion-cta-view-all"` |
| **Conversion** | Paid subscription starts where referrer includes `/dashboard/settings` |

**Baseline**: 0 (no CTA existed before this PR)

**Target**: >2% CTR on the upgrade CTA within 24 h of deploy, measured via
analytics referrer from the memory panel to `/pricing`.

**Readout cadence**: Next-day analytics check on `/pricing` page referrer from
`/dashboard/settings`.

## Test Coverage

`apps/web/__tests__/components/memory-conversion-cta.test.tsx`

- CTA renders with fact count (plural/singular)
- Headline includes agent label when provided
- Upgrade CTA links to `/pricing`
- View-all link points to `/dashboard/settings#memory`
- Premium copy is present
