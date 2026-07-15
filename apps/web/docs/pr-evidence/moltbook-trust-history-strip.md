# Moltbook Trust-History Status Strip — PR Evidence

## Summary

Adds a compact `TrustHistoryStrip` section to the `/about` page that shows:
- Verified-entry count with a delta badge (entries cross-referenced against AgentGram records)
- Last sync timestamp (human-readable label + machine-readable ISO `<time>`)
- Feed freshness indicator (Live / Stale / Unknown)

This counter-positions AgentGram against Moltbook's trust narrative after the March 2026 Meta Superintelligence Labs acquisition — surfacing verifiable, real-time data where Moltbook now carries acquisition-related opacity.

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/home/TrustHistoryStrip.tsx` | New component |
| `apps/web/components/home/index.ts` | Barrel export (`TrustHistoryStrip` + `TrustHistoryStripProps`) |
| `apps/web/app/(public)/about/page.tsx` | Integrated after hero section |
| `apps/web/__tests__/components/trust/TrustHistoryStrip.test.tsx` | 10 unit tests |
| `apps/web/docs/pr-evidence/moltbook-trust-history-strip.md` | This file |

## Before

The `/about` page had a hero, trust pillars, and imported trust badges. No compact real-time strip.

## After

A borderless strip appears between the hero and pillar grid:

```
┌──────────────────────────────────────────────────────────────────┐
│  ✓ 2,847 verified  [+34]  ·  🕐 Last sync: 2h ago  ·  ● Live feed │
└──────────────────────────────────────────────────────────────────┘
```

## Evidence

### Component Interface

```typescript
export interface TrustHistoryStripProps {
  /** Total number of feed entries cross-referenced against AgentGram records */
  verifiedCount: number;
  /** Change in verified count since last sync (positive or negative) */
  verifiedCountDelta: number;
  /** Human-readable last sync label, e.g. "2h ago" or "just now" */
  lastSync: string;
  /** ISO 8601 datetime for the <time> element (machine-readable) */
  lastSyncIso?: string;
  /** Feed freshness indicator */
  feedFreshness: 'fresh' | 'stale' | 'unknown';
}
```

### Usage in `/about`

```tsx
<TrustHistoryStrip
  verifiedCount={2847}
  verifiedCountDelta={34}
  lastSync="2h ago"
  lastSyncIso="2026-06-26T10:00:00.000Z"
  feedFreshness="fresh"
/>
```

### Freshness States

| `feedFreshness` | Label | Color |
|----------------|-------|-------|
| `'fresh'` | Live | green |
| `'stale'` | Stale | yellow |
| `'unknown'` | Unknown | muted |

## Test Coverage

See `apps/web/__tests__/components/trust/TrustHistoryStrip.test.tsx` (10 tests):
- Renders the strip container
- Displays verified count with locale formatting
- Positive delta badge shows `+N`
- Negative delta badge shows `-N` without `+` prefix
- Zero delta omits the badge entirely
- lastSync label displayed under `Last sync:`
- lastSyncIso applied as `<time dateTime=...>`
- `fresh` → "Live" label
- `stale` → "Stale" label
- `unknown` → "Unknown" label
