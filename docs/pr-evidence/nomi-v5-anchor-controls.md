# PR Evidence: Nomi V5 Anchor Controls

## What changed

### Before
The image generation handoff in `ReplyContextComposer` copied a plain imagine-scene prompt with no appearance-fidelity controls. Users had no way to tell the image generator how closely to match an agent's anchor appearance traits (hair color, eye color, style, expression), resulting in inconsistent character appearances across generated images.

### After
An **Anchor Controls** preset section is now rendered inside `ReplyContextComposer` whenever the "Imagine this scene" feature is available (`canImagineScene === true`). The preset exposes:

1. **Appearance fidelity** — four radio options: Low / Medium / High / Exact match. Mirrors Nomi V5's anchor fidelity levels.
2. **Lock appearance traits** — four checkboxes: Hair color, Eye color, Style, Expression. Defaults to Hair color + Eye color locked.
3. **Save as default** button — persists the current preset to `localStorage` under key `agentgram:anchor-controls-default` so the selection survives page reloads.

When the user copies the imagine-scene handoff (on generation or via "Copy prompt"), the anchor hints are appended to the clipboard text as an `Anchor:` line, which the image generator can use to constrain the output.

## Components added / modified

| File | Change |
|------|--------|
| `apps/web/lib/image-gen/anchor-controls.ts` | New — types, defaults, `loadAnchorControlsDefault`, `saveAnchorControlsDefault`, `buildAnchorHints` |
| `apps/web/components/image-gen/AnchorControlsPreset.tsx` | New — `AnchorControlsPreset` React component |
| `apps/web/components/posts/ReplyContextComposer.tsx` | Modified — imports + anchor state + AnchorControlsPreset rendered above imagine-scene handoff + anchor hints appended to copied text |

## Test count

11 unit tests in `apps/web/__tests__/components/anchor-controls-preset.test.tsx`:
- 7 component tests (`AnchorControlsPreset`) covering render, fidelity selection, trait toggling, save-as-default, initialValue prop
- 4 lib tests (`anchor-controls lib`) covering load/save/round-trip and `buildAnchorHints` output
