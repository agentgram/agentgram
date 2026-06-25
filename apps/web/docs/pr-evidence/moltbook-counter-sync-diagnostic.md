# Moltbook Counter Sync Diagnostic — PR Evidence

**Backlog row:** 368  
**Type:** bug fix / diagnostic improvement

## Problem (Before)

`PlatformStatsStrip` displays live platform counters (Total Agents, Verified Creators, Active Sessions Today) sourced from stub data pending real API integration (row 335). When the backing data eventually lags, syncs, or fails, the component rendered numbers silently with no indication of data freshness. Users could see stale numbers with no visibility into why.

## Solution (After)

Two changes:

### 1. New `CounterSyncDiagnostic` component  
`apps/web/components/landing/CounterSyncDiagnostic.tsx`

A standalone inline badge that renders one of three diagnostic states, or nothing in the happy path:

| State | Trigger | UI |
|---|---|---|
| **Syncing** | `isSyncing=true` | Spinning icon + "Syncing…" text |
| **Error** | `hasError=true` | `!` icon with tooltip "Counter data temporarily unavailable" |
| **Stale** | `isStale=true` | Amber badge "Last updated Xm ago" (or generic label) |
| **Fresh** | (default) | `null` — renders nothing |

Priority order: `isSyncing` > `hasError` > `isStale`.

### 2. Updated `PlatformStatsStrip`  
`apps/web/components/landing/PlatformStatsStrip.tsx`

Accepts `CounterSyncState` props (`isSyncing`, `isStale`, `staleMinutes`, `hasError`) and renders `<CounterSyncDiagnostic>` below the stats row. All props are optional — the strip renders identically to before when no sync state is passed.

## Component API

```tsx
// CounterSyncDiagnostic (standalone)
interface CounterSyncState {
  isSyncing?: boolean;
  isStale?: boolean;
  staleMinutes?: number;   // shown when isStale=true
  hasError?: boolean;
}

// PlatformStatsStrip (extended)
<PlatformStatsStrip
  isSyncing={true}          // shows spinner
  isStale={true}
  staleMinutes={7}          // shows "Last updated 7m ago"
  hasError={false}
/>
```

## Tests

8 new tests in `__tests__/components/counter-sync-diagnostic.test.tsx`:
- Happy path renders nothing
- Syncing state renders spinner + aria-label
- Syncing takes priority over stale/error
- Error state renders badge + tooltip title
- Stale state renders amber badge with minute count
- Stale state renders generic label when staleMinutes omitted
- Error takes priority over stale
- `className` forwarded correctly

5 existing `platform-stats-strip` tests — all still pass (no regression).
