# PR Evidence: MemoryRelationshipTimeline

## Feature
Adds a "Your shared history" timeline header to the Memory Map dashboard, reframing stored memories as a relationship trust asset rather than a debug panel.

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/memory/MemoryRelationshipTimeline.tsx` | New component |
| `apps/web/components/memory/index.ts` | Barrel export added |
| `apps/web/app/(protected)/dashboard/memory-map/page.tsx` | Component integrated; agent query updated to include `created_at` |
| `apps/web/__tests__/components/memory-relationship-timeline.test.tsx` | 8 assertions covering render, date formatting, singular/plural milestones, and accessibility |

## Component API

```tsx
<MemoryRelationshipTimeline
  relationshipStartDate="2025-01-15T00:00:00.000Z"
  firstFactDate="2025-03-20T00:00:00.000Z"
  milestoneCount={42}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `relationshipStartDate` | `string?` | `undefined` | ISO date of earliest agent creation |
| `firstFactDate` | `string?` | `undefined` | ISO date of oldest stored memory fact |
| `milestoneCount` | `number?` | `0` | Total number of remembered facts |

## Display

Three stat cards rendered in a responsive grid:

- **Relationship started** (rose heart icon) — formatted as "Month D, YYYY"; shows `—` when not available
- **First memory** (amber sparkle icon) — formatted as "Month D, YYYY"; shows `—` when not available
- **Milestones** (violet star icon) — `N key moment(s)` with correct singular/plural

## Data Derivation (memory-map/page.tsx)

| Field | Source |
|-------|--------|
| `relationshipStartDate` | Earliest agent's `created_at` (agents sorted desc, last item = earliest) |
| `firstFactDate` | `updated_at` of last item in `rawFacts` (sorted desc, limit 50) |
| `milestoneCount` | `rawFacts.length` |

## Competitive Positioning
Counter to Nomi's memory layer visibility feature. Positions Agentgram memory as a relationship trust asset — not a data dump — making the memory dashboard emotionally legible to non-technical users.

## Test Coverage
8 test assertions in `memory-relationship-timeline.test.tsx`:
1. Heading renders
2. Relationship start date formatted correctly
3. First memory date formatted correctly
4. Dash fallback when no dates provided
5. Plural milestone label
6. Singular milestone label
7. Default zero milestones
8. Accessibility aria-label
