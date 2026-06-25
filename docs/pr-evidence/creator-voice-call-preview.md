# Creator Voice-Call Preview — PR Evidence

Backlog row 141 · P3 ux

## Before

Agent cards on the explore page showed capability modality badges ("Replies with: Voice / Video …") but gave no signal about whether the creator is actually reachable for a live text chat or voice call. Users had no quick way to preview what the agent's voice sounds like before opening the profile.

## After

Each agent card now includes a **CreatorVoiceCallPreview** section that shows:

- **채팅 가능** (green badge) — agent supports text chat (default: always shown)
- **통화 가능** (blue badge) — agent supports voice calls (shown when `capabilities.voice === true`)
- **Inline voice sample player** — when a `voiceSampleUrl` is available, a small "Hear voice sample" button appears with idle → loading → playing → paused → ended state transitions and an animated waveform indicator

## Component API

### `CreatorVoiceCallPreview`

**Location:** `apps/web/components/agents/CreatorVoiceCallPreview.tsx`

```typescript
export interface VoiceCallAvailability {
  text: boolean;
  voice: boolean;
}

export interface CreatorVoiceCallPreviewProps {
  availability: VoiceCallAvailability;
  voiceSampleUrl?: string;
  voiceSampleLabel?: string;  // agent name for aria-label
  className?: string;
  _audioFactory?: (src: string) => HTMLAudioElement; // test injection
}
```

Returns `null` when all availability flags are false and no `voiceSampleUrl` is provided.

### `formatAvailabilityLabel`

**Location:** `apps/web/lib/voice-call-preview.ts`

```typescript
formatAvailabilityLabel({ text: true,  voice: true  }) // "채팅 · 통화 가능"
formatAvailabilityLabel({ text: true,  voice: false }) // "채팅 가능"
formatAvailabilityLabel({ text: false, voice: true  }) // "통화 가능"
formatAvailabilityLabel({ text: false, voice: false }) // "오프라인"
```

## Integration

`AgentCard` passes derived availability from `agent.capabilities`:

```tsx
<CreatorVoiceCallPreview
  className="mt-3"
  availability={{
    text: true,                              // always true
    voice: agent.capabilities?.voice === true,
  }}
  voiceSampleUrl={agent.voiceSampleUrl ?? undefined}
  voiceSampleLabel={agent.display_name ?? agent.displayName ?? agent.name}
/>
```

`voiceSampleUrl` is an optional new field on `AgentCardAgent`; defaults to `undefined` so existing cards are unaffected.

## Test coverage

`apps/web/__tests__/components/creator-voice-call-preview.test.tsx` — 13 tests:

| # | Scenario |
|---|----------|
| 1 | Chat badge visible when `text=true` |
| 2 | Voice badge visible when `voice=true` |
| 3 | Both badges shown when both true |
| 4 | Chat badge absent when `text=false` |
| 5 | Voice badge absent when `voice=false` |
| 6 | Returns nothing when both false and no URL |
| 7 | Voice sample player shown with URL |
| 8 | Voice sample player absent without URL |
| 9 | Player renders in idle state initially |
| 10 | Playing state after click + canplay |
| 11 | Paused after click while playing |
| 12 | Resets to idle when audio ends |
| 13 | Container rendered when only URL provided (both flags false) |
