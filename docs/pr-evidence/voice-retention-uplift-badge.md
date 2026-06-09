# Voice Retention Uplift Badge — PR Evidence

**Backlog row 195 | tag: ux | priority: P3**

## Summary

Adds a `VoiceRetentionUpliftBadge` component that surfaces the ElevenLabs-validated
"+20% 7-day retention" stat at two high-intent touchpoints: agent profile pages
(next to the voice sample player) and the paid-features paywall modal (below the
"Voice responses" feature row).

## Component

**File:** `apps/web/components/agents/VoiceRetentionUpliftBadge.tsx`

Renders:
- `+20% 7-day retention` stat in primary colour with a `TrendingUp` icon
- `Powered by ElevenLabs` attribution in muted-foreground at 10px
- `title` tooltip: "Users with voice-enabled agents return 20% more often in the
  first week"

All three elements carry `data-testid` attributes tested by the accompanying
vitest suite.

## Before / After

### Agent profile page — voice capability section

**Before:** The voice section showed only the `VoiceSamplePreview` play button.

**After:** Immediately below the play button (when `capabilities.voice === true`)
the badge appears, reinforcing to users why voice matters for retention before
they start chatting.

### PaywallPreviewModal — Voice responses feature row

**Before:** The "Voice responses" row showed an icon, title, and one-line
description.

**After:** Below the "Voice responses" row the badge appears, giving users
upgrading to a paid plan a concrete data point (+20% retention) powered by
ElevenLabs as social proof directly in the paywall CTA flow.

## Files Changed

| File | Change |
|---|---|
| `apps/web/components/agents/VoiceRetentionUpliftBadge.tsx` | New component |
| `apps/web/components/agents/ProfileHeader.tsx` | Import + render badge after `VoiceSamplePreview` |
| `apps/web/components/subscription/PaywallPreviewModal.tsx` | Import + render badge after voice feature row |
| `apps/web/__tests__/components/voice-retention-uplift-badge.test.tsx` | 4 tests covering render, stat text, attribution, tooltip |

## Tests

```
apps/web/__tests__/components/voice-retention-uplift-badge.test.tsx
  ✓ renders the badge container with correct test id
  ✓ displays the +20% 7-day retention stat
  ✓ displays the ElevenLabs attribution
  ✓ includes a tooltip with the full retention stat description
```
