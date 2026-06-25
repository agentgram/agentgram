# PR Evidence: Nomi V3 Voice Diff Player

## Summary

Adds a `VoiceDiffPlayer` component that lets users hear and compare V2 Legacy and V3 Enhanced voice
samples side-by-side, then select their preferred version directly from the voice settings section
of `/dashboard/settings`.

## Component Path

`apps/web/components/voice/VoiceDiffPlayer.tsx`

## UI Description

The player renders two cards in a horizontal group under a "Voice comparison" heading:

| Card | Label | Badge | Sample URL |
|------|-------|-------|------------|
| Left | V2 Legacy | Legacy (muted) | `/api/voice/sample/v2` |
| Right | V3 Enhanced | New (primary) | `/api/voice/sample/v3` |

Each card contains:
- **Play / Pause button** — loads and plays the respective audio sample; only one track plays at a
  time (starting one stops the other).
- **Select CTA button** — calls `onSelect(version)` and updates the `aria-pressed` state. The
  active card shows "Selected" with a `CheckCircle2` icon; the inactive card shows "Use V2 Legacy"
  / "Use V3 Enhanced".
- The selected card receives a highlighted border (`border-primary/60 bg-primary/5`).

## Placement

`apps/web/app/(protected)/dashboard/settings/page.tsx` — rendered inside a dedicated Card block
titled "Voice Version" above the existing voice settings, visible only to authenticated users.

## Audio Handling

Uses the same `_audioFactory` injection pattern as `VoiceSamplePreview` — real `new Audio(src)` in
production, injected mock in tests.  Placeholder URLs (`/api/voice/sample/v2`,
`/api/voice/sample/v3`) are used until real ElevenLabs samples are wired up.

## Tests

`apps/web/__tests__/components/voice-diff-player.test.tsx` — 8 test cases covering:
- Container render with `data-testid`
- V2/V3 labels and badges
- `onSelect` callback for both versions
- `aria-pressed` state reflects `selectedVersion` prop
- "Selected" vs "Use …" label switching
- Play→Pause button label change on `canplay` event
