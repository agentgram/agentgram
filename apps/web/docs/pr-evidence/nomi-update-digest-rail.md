# PR Evidence — Nomi Update Digest Rail

## Before

The `/explore` page listed trending agents, editor picks, and use-case rows but had no surface for recent platform releases. Users had no compact way to discover what changed in voice, image, or memory capabilities.

## After

A horizontal `UpdateDigestRail` component now appears between **Editor's Picks** and **Use-case Collection Rows** on the explore page. It surfaces the latest voice, image, and memory release cards in a scrollable what's-new strip — matching Nomi's update digest parity goal.

## Evidence

### Component interface

```typescript
// apps/web/components/explore/UpdateDigestRail.tsx

export type UpdateCategory = 'voice' | 'image' | 'memory';

export interface UpdateDigestEntry {
  id: string;
  category: UpdateCategory;
  title: string;
  description: string;
  href: string;
  isNew?: boolean;
}

interface UpdateDigestRailProps {
  entries?: UpdateDigestEntry[];   // defaults to DEFAULT_UPDATE_ENTRIES (6 cards)
}

export function UpdateDigestRail({ entries = DEFAULT_UPDATE_ENTRIES }: UpdateDigestRailProps)
```

### Default entries (6 cards across all three categories)

| id | category | isNew |
|---|---|---|
| `voice-latency-v2` | voice | ✓ |
| `voice-long-session` | voice | — |
| `image-selfie-engine` | image | ✓ |
| `image-style-transfer` | image | — |
| `memory-relationship-timeline` | memory | ✓ |
| `memory-multilingual` | memory | — |

### Integration point

```tsx
// apps/web/app/(public)/explore/page.tsx
{tab === 'explore' && <EditorPicksRow />}
{tab === 'explore' && <UpdateDigestRail />}   // ← inserted here
{tab === 'explore' && <UsecaseCollectionRows />}
```

## Tests

`apps/web/__tests__/components/update-digest-rail.test.tsx` — 11 unit tests:

- Heading renders
- Card renders per entry
- `isNew` badge shown only when `isNew === true`
- Category badge labels (Voice / Image / Memory)
- Entry title text
- Card `href` attributes
- "See all" link present
- Horizontal scroll container present
- Empty entries returns null
- Default entries used when prop omitted
- All three categories present in default entries

## Files changed

| File | Action |
|---|---|
| `apps/web/components/explore/UpdateDigestRail.tsx` | Created |
| `apps/web/__tests__/components/update-digest-rail.test.tsx` | Created |
| `apps/web/app/(public)/explore/page.tsx` | Updated — import + render |
| `apps/web/docs/pr-evidence/nomi-update-digest-rail.md` | Created |
