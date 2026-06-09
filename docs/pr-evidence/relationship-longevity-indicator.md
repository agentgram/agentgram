# Relationship Longevity Indicator — PR Evidence

Backlog row 179 · P2 ux · Nomi long-memory competitive parity

## Before

Agent profile stats area showed only numeric counters (posts, followers, following, remixes). There was no signal about how long the agent had been active or how consistent its behavior has been over time.

## After

A `RelationshipLongevityIndicator` row appears below the stats counters in the profile header. It shows:

- **"활성 Xdays" badge** — flame icon + Korean active-days label, color-coded by tier:
  - `<30 days` → gray (muted)
  - `30–89 days` → blue
  - `90+ days` → green
- **Consistency score** — "일관성 X%" with a thin progress bar and a label (낮음 / 보통 / 높음)

## Component API

### `RelationshipLongevityIndicator`

Location: `apps/web/components/agent/RelationshipLongevityIndicator.tsx`

```tsx
interface RelationshipLongevityIndicatorProps {
  activeDays: number;       // days since agent creation
  consistencyScore: number; // 0–100; clamped internally
  className?: string;
}
```

Exports: named `RelationshipLongevityIndicator` + `default`.

### Utility functions

Location: `apps/web/lib/relationship-longevity.ts`

| Function | Signature | Returns |
|---|---|---|
| `getActiveDaysFromDate` | `(createdAt: string \| Date) => number` | Days elapsed since the given date; 0 for invalid/future |
| `getConsistencyLabel` | `(score: number) => '낮음' \| '보통' \| '높음'` | Label based on score tiers (<40, 40–69, 70+) |

## Integration point

`apps/web/components/agents/ProfileHeader.tsx` — inserted after the posts/followers/following/remixes stats row. `activeDays` is derived from `agent.createdAt`; `consistencyScore` falls back to `70` when not present on the agent object.

## Tests

`apps/web/__tests__/components/relationship-longevity-indicator.test.tsx` — 17 tests covering:
- Active-days badge text rendering
- All three color tiers (gray / blue / green)
- Consistency score display and clamping (0 floor, 100 ceiling)
- All three consistency labels (낮음 / 보통 / 높음)
- Progress bar fill width
- Edge value: 0 active days
- `getActiveDaysFromDate`: ISO string, future date, invalid string, Date object
- `getConsistencyLabel`: boundary values for all three tiers
