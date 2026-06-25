# FilterEffectExplainer — PR Evidence

## Summary

Adds a `FilterEffectExplainer` component to the creator flow that explains, in plain language, why a Character.AI-style character or prompt was **filtered**, **hidden**, or **deprioritized**. Shows an icon, a clear title, a contextual description, actionable guidance, and a direct action button.

Source: backlog.md row 388

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/agents/FilterEffectExplainer.tsx` | New component — three effect variants (filtered / hidden / deprioritized) |
| `apps/web/components/agents/index.ts` | Export `FilterEffectExplainer`, `FilterEffect`, `FilterEffectExplainerProps` |
| `apps/web/app/(protected)/dashboard/page.tsx` | Import + render explainer below banned/suspended agents |
| `apps/web/__tests__/components/filter-effect-explainer.test.tsx` | 12 unit tests covering all variants, props, and accessibility |

## Component API

```tsx
<FilterEffectExplainer
  effect="filtered" | "hidden" | "deprioritized"
  characterName?: string   // e.g. "Luna" — defaults to "This character"
  className?: string
/>
```

## Effect Variants

### `filtered` — Content Filtered
- **Icon**: `AlertTriangle` (red)
- **When**: Agent status is `banned`
- **Action**: Links to `/docs/content-policy`

```
┌─────────────────────────────────────────────────────┐
│ ⚠  Content Filtered                                  │
│    "Luna" — This character or prompt was blocked by  │
│    the content moderation system…                    │
│                                                      │
│  ℹ Review your character's persona description…     │
│  [ Review Content Policy ]                           │
└─────────────────────────────────────────────────────┘
```

### `hidden` — Content Hidden
- **Icon**: `EyeOff` (amber)
- **When**: Agent status is `suspended`
- **Action**: Links to `/dashboard/tune`

```
┌─────────────────────────────────────────────────────┐
│ 👁  Content Hidden                                   │
│    "Luna" — This character or prompt is currently    │
│    hidden from public discovery…                     │
│                                                      │
│  ℹ Check the character's visibility setting…        │
│  [ Edit Visibility ]                                 │
└─────────────────────────────────────────────────────┘
```

### `deprioritized` — Deprioritized in Discovery
- **Icon**: `TrendingDown` (sky blue)
- **When**: Manually surfaced or future low-score signal
- **Action**: Links to `/dashboard/tune`

```
┌─────────────────────────────────────────────────────┐
│ 📉  Deprioritized in Discovery                       │
│    "Luna" — This character is still visible but      │
│    ranks lower in discovery feeds…                   │
│                                                      │
│  ℹ Improve discoverability by completing the        │
│    persona description, adding topic tags…           │
│  [ Optimize Character ]                              │
└─────────────────────────────────────────────────────┘
```

## Dashboard Integration

The dashboard agent list now maps agent status → filter effect:

| `AGENT_STATUS` | `FilterEffect` |
|----------------|----------------|
| `banned`       | `filtered`     |
| `suspended`    | `hidden`       |
| `active`       | _(no explainer shown)_ |

The explainer renders inline below the affected agent row.

## Tests

12 tests across:
- All 3 effect variants render with correct `data-effect` attribute and title text
- `characterName` prop inclusion / fallback to "This character"
- Action button href per variant
- Accessibility: `role="note"`, guidance text, icon presence

## Before / After

**Before**: Banned or suspended agents showed only a secondary badge with no explanation. Creators had no context on why or what to do.

**After**: A contextual card appears below affected agents with the reason, platform policy context, and a direct action link to resolve the issue.
