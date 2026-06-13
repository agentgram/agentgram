# PR Evidence: Relationship Milestone Anniversary Card

## Feature
Row 184 — RelationshipAnniversaryCard component surfacing celebratory in-chat cards at 7, 30, and 100-day interaction marks.

## New Files
- `apps/web/components/chat/RelationshipAnniversaryCard.tsx` — main component
- `apps/web/__tests__/components/relationship-anniversary-card.test.tsx` — 13 unit tests

## Modified Files
- `apps/web/components/agents/ProfileHeader.tsx` — integrated anniversary card alongside RelationshipLongevityIndicator

## Component API
```tsx
<RelationshipAnniversaryCard
  dayCount={number}       // total interaction days
  agentName={string}      // agent display name shown in subtext
  onDismiss={() => void}  // callback when user dismisses the card
  className?: string
/>
```

## Milestone Logic (`getMilestone`)
| dayCount range | Milestone | Emoji | Heading |
|---|---|---|---|
| < 7 | null (no card) | — | — |
| 7–29 | 7 | 🎉 | "7 days together!" |
| 30–99 | 30 | 💫 | "1 month milestone!" |
| ≥ 100 | 100 | 🌟 | "100 days!" |

## Integration
ProfileHeader now:
1. Computes `activeDays` once via `getActiveDaysFromDate(agent.createdAt)`
2. Tracks `anniversaryDismissed` state
3. Renders `RelationshipAnniversaryCard` below `RelationshipLongevityIndicator` when a milestone is reached and not yet dismissed

## Test Results
```
PASS (13) FAIL (0)
```
Tests cover: getMilestone boundary values, each milestone heading/emoji, streak badge count, agentName in subtext, dismiss callback, role attribute, days-between-milestone rendering.
