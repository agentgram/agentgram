# Voice Latency Indicator Badge — PR Evidence

**Backlog row:** 159
**Feature:** Display measured voice response latency on agent capability cards with Nomi's <2s (Jan 2026) as market reference benchmark.

## Before

Agent capability cards in the directory listing showed voice modality ("Replies with Voice") but gave no indication of how fast the voice response was. Users had no way to compare voice responsiveness between agents or understand where an agent stood relative to market leaders like Nomi (<2s as of Jan 2026).

Modality badges section (AgentCard):
- Voice: "Replies with 🎤 Voice" badge only — no latency signal
- No tier differentiation between fast and slow voice agents

## After

A new `VoiceLatencyBadge` component renders a color-coded latency badge alongside the voice modality badge in the "Replies with" row of the agent capability card. The badge is only shown when `voiceLatencyMs` is provided and voice capability is enabled.

### New files

| File | Purpose |
|------|---------|
| `apps/web/components/agents/VoiceLatencyBadge.tsx` | Badge component — tier classification, label formatting, color-coded rendering |
| `apps/web/__tests__/components/voice-latency-badge.test.tsx` | 17 unit tests covering tier logic, label display, data attributes, boundary conditions |

### Modified files

| File | Change |
|------|--------|
| `apps/web/components/agents/AgentCard.tsx` | Added `voiceLatencyMs?: number \| null` to `AgentCardAgent`; imports `VoiceLatencyBadge`; renders badge after modality badges when voice is enabled and `voiceLatencyMs` is present |
| `packages/shared/src/types/agent.ts` | Added `voiceLatencyMs?: number` to the `Agent` interface |

## Color-coding tiers

| Latency range | Tier | Color | Rationale |
|---------------|------|-------|-----------|
| < 2000ms | fast | Green | At or below Nomi Jan 2026 benchmark (<2s) |
| 2000–5000ms | medium | Yellow | Noticeable but acceptable voice delay |
| > 5000ms | slow | Gray/muted | High-latency — may impact conversational feel |

### Badge label display

| Tier | Label |
|------|-------|
| fast | `<2s` |
| medium | `2–5s` |
| slow | `>5s` |

### Integration behavior

- Badge is rendered inside the `agent-card-modality-badges` row, immediately after the modality badge map
- Only rendered when `agent.capabilities?.voice === true` **and** `agent.voiceLatencyMs != null`
- `data-testid="voice-latency-badge"` for test selection
- `data-latency-tier` attribute exposes tier for targeted CSS/test assertions
- `title` tooltip includes the Nomi benchmark reference: `Voice latency: <2s (Nomi benchmark: <2s)`

## Test results

```
PASS (17) FAIL (0)
```

Tests cover:
- `getVoiceLatencyTier`: fast/medium/slow for all boundary values (0, 1999, 2000, 3500, 5000, 5001)
- `getVoiceLatencyLabel`: correct label strings for each tier
- `VoiceLatencyBadge` renders with `data-testid`
- Correct label text for each tier
- `data-latency-tier` attribute set correctly for each tier
- Title includes "Nomi benchmark" reference string
- `className` prop forwarded correctly
- Boundary conditions: exactly 2000ms = medium, exactly 5000ms = medium

## TypeScript

`npx tsc --noEmit` → No errors.
