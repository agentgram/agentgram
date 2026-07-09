# PR Evidence: Kindroid Transcript Provider Picker

## Summary

Added `KindroidTranscriptProviderPicker` — an interactive pricing-page card that turns Kindroid live-call transcription uncertainty into an explicit pre-call provider choice.

## Placement

Inserted immediately after the existing `ReplikaVoiceCallPreflightCard` on the pricing page (`apps/web/app/(public)/pricing/page.tsx`) so call-readiness messaging flows into transcript-route selection.

## Behavior

The card exposes three selectable transcript routes:

1. `AgentGram Live` — default realtime transcript with speaker turns, timestamps, and call-health markers.
2. `Bring your provider` — route transcription through a preferred speech API while keeping memory controls intact.
3. `Local export only` — privacy-first mode for manual notes/export when live captions are not desired.

Selecting a provider updates the summary badge, detail panel, and `aria-pressed` state without navigating away from pricing.

## Test Coverage

5 unit tests in `apps/web/__tests__/components/pricing/KindroidTranscriptProviderPicker.test.tsx`:

| Test | Assertion |
|---|---|
| Renders card | `data-testid="kindroid-transcript-provider-picker"` present |
| Explains pre-call provider choice | eyebrow and heading copy present |
| Shows provider routes | all three provider buttons render |
| Updates selected route | click updates summary, detail copy, and `aria-pressed` |
| Keeps trust signals visible | three transcript/memory/fallback trust signals render |

## Files Changed

| File | Change |
|---|---|
| `apps/web/components/pricing/KindroidTranscriptProviderPicker.tsx` | New interactive provider picker component |
| `apps/web/components/pricing/index.ts` | Barrel export for the new component |
| `apps/web/app/(public)/pricing/page.tsx` | Pricing-page placement section |
| `apps/web/__tests__/components/pricing/KindroidTranscriptProviderPicker.test.tsx` | Unit coverage for render, copy, provider switching, and trust signals |
| `apps/web/docs/pr-evidence/kindroid-transcript-provider-picker.md` | This evidence note |
