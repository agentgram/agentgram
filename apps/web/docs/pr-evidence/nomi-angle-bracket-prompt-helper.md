# Nomi Angle-Bracket Prompt Helper — PR Evidence

## Summary

Adds `AngleBracketPromptHelper` to the image-gen component suite. The component sits alongside the image generation composer and surfaces categorized Nomi V5 anchor-tag chips (`<hair:wavy>`, `<eyes:green>`, etc.) that users can tap to either insert directly into their prompt or copy to the clipboard.

Mirrors the anchor-fidelity system introduced in PR #818 with a discoverability layer — users who don't know Nomi V5's `<key:value>` syntax can learn it inline without leaving the composer.

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/image-gen/AngleBracketPromptHelper.tsx` | New component |
| `apps/web/__tests__/components/angle-bracket-prompt-helper.test.tsx` | 15 unit tests |
| `apps/web/docs/pr-evidence/nomi-angle-bracket-prompt-helper.md` | This file |

## Before

Image generation composer area contained:
- `GettingStartedImageGuide` — general prompt tips and style presets
- `AnchorControlsPreset` — fidelity + trait-lock controls

No surface exposed the raw `<key:value>` anchor tag syntax, so users had to already know Nomi V5 docs to use it.

## After

### AngleBracketPromptHelper

A collapsible helper renders below the composer:

```
┌──────────────────────────────────────────────────────────┐
│  🏷  Anchor tags — Nomi V5 prompt syntax           ∨     │
├──────────────────────────────────────────────────────────┤
│  Tap a tag to insert it into your prompt.                │
│                                                          │
│  Hair                                                    │
│  [<hair:wavy>] [<hair:straight>] [<hair:curly>] …       │
│                                                          │
│  Eyes                                                    │
│  [<eyes:blue>] [<eyes:green>] [<eyes:brown>] …          │
│                                                          │
│  Outfit                                                  │
│  [<outfit:casual>] [<outfit:formal>] …                  │
│                                                          │
│  Background                                              │
│  [<background:indoor>] [<background:outdoor>] …         │
│                                                          │
│  Expression                                              │
│  [<expression:smiling>] [<expression:serious>] …        │
│                                                          │
│  Anchor tags tell Nomi V5 to lock specific appearance    │
│  traits in generated images.                            │
└──────────────────────────────────────────────────────────┘
```

### Component API

```tsx
<AngleBracketPromptHelper
  onInsert={(tag) => appendToPrompt(tag)}  // optional: insert mode
  defaultOpen={false}                       // optional: start expanded
/>
```

- **`onInsert` provided** → chips call `onInsert(tag)` on click; hint reads "Tap a tag to insert it into your prompt."
- **`onInsert` absent** → chips copy to clipboard via `navigator.clipboard`; hint reads "Tap a tag to copy it, then paste into your prompt."
- Collapse/expand is local state, toggled by the header button.
- `aria-expanded` attribute tracks open state for accessibility.

## Auth-Only Proof

The component is purely presentational and carries no auth logic. Image generation itself is gated behind the `(protected)` route group — the helper only renders in contexts where the user is already authenticated.

## Test Coverage

All 15 tests pass (`apps/web/__tests__/components/angle-bracket-prompt-helper.test.tsx`):

- Renders toggle button with correct `data-testid`
- Collapsed by default, panel not visible
- Opens panel on toggle click
- Closes panel on second toggle click
- `defaultOpen=true` renders panel immediately
- All five tag categories present when open
- Expected anchor-tag chips rendered
- Chip text displays angle-bracket syntax
- `onInsert` called with correct tag string on click (hair, straight, expression variants)
- Insert hint text shown when `onInsert` is provided
- Copy hint text shown when `onInsert` is absent
- `aria-expanded` false when closed, true when open
