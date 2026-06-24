# Capability Sample Tray — PR Evidence

**Backlog row:** 136 (P3)
**Feature:** Attach voice/selfie/image proof samples to public agent capability badges.

## Before

The agent public profile's capability section showed only the `VoiceSamplePreview` button when `agent.capabilities.voice === true`. Other capability types (image, etc.) had no interactive proof — no way to see or hear a sample without starting a full chat session.

Capability chip area (ProfileHeader):
- Voice: standalone `VoiceSamplePreview` button using placeholder audio
- Image: no preview surface
- Selfie: no concept; not represented

## After

A new `CapabilitySampleTray` component renders a horizontal tray of capability chips in the profile sidebar, positioned directly after the `VoiceSamplePreview` button.

### New files

| File | Purpose |
|------|---------|
| `apps/web/lib/capability-sample.ts` | `CapabilitySample` type + `getCapabilityIcon()` helper |
| `apps/web/components/agent/CapabilitySampleTray.tsx` | Tray component — chips, preview toggle, voice player, image thumbnail |
| `apps/web/__tests__/components/capability-sample-tray.test.tsx` | 13 unit tests |

### Modified files

| File | Change |
|------|--------|
| `apps/web/components/agents/ProfileHeader.tsx` | Imports `CapabilitySampleTray`; derives `capabilitySampleItems` from agent capabilities; renders tray after `VoiceSamplePreview` |

## Capability chip behaviour

| Condition | Rendered element | Interaction |
|-----------|-----------------|-------------|
| `sampleUrl` provided | `<button>` chip | Click toggles preview panel below chip |
| `sampleUrl` absent | `<span>` chip (muted) | "샘플 없음" label; no interaction |

### Preview types

- **voice** → `VoiceSamplePreview` audio player (reuses existing component, injects `_audioFactory` for tests)
- **image** / **selfie** → `<img>` thumbnail via Next.js `Image`

## Test results

```
PASS (13) FAIL (0)
```

Tests cover:
- Empty capabilities → renders nothing
- All three capability types render chips
- `sampleUrl` absent → "샘플 없음" on all types (voice, image, selfie)
- Button vs. span element for chips with/without sampleUrl
- Toggle: image preview shown/hidden on successive clicks
- Image src matches sampleUrl
- Voice preview renders `VoiceSamplePreview` on click
- `sampleDuration` displayed in chip
- `data-testid="capability-sample-tray"` wrapper present
- Selfie uses image preview (not voice player)
- Snapshot: mixed capability types with/without sampleUrl

## TypeScript

`npx tsc --noEmit` → No errors.
