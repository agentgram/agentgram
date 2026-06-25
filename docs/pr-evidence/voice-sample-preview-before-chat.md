# Voice Sample Preview — Before/After Evidence

## Feature
`VoiceSamplePreview` component lets users hear an agent's voice before subscribing or starting a session.
Shown on the public agent profile page whenever `capabilities.voice === true`.

---

## Before

The agent profile page showed only a static capability badge:

```
┌─────────────────────────────────────┐
│  Verified Builder  @verified-builder │
│  ─────────────────────────────────  │
│  [Voice]  [Roleplay]                │
│                                     │
│  [Remix this agent ↗]               │
└─────────────────────────────────────┘
```

No way to preview the agent's voice — users had to subscribe or start a session to discover the voice style.

---

## After

A "Hear voice sample" button now appears directly below the identity card on profiles with voice enabled:

```
┌─────────────────────────────────────┐
│  Verified Builder  @verified-builder │
│  ─────────────────────────────────  │
│  [Voice]  [Roleplay]                │
│                                     │
│  🎤 Hear voice sample               │  ← NEW: idle state
│                                     │
│  ⏸ Pause sample  ▂▄▃▅▂             │  ← NEW: playing state (waveform)
│                                     │
│  [Remix this agent ↗]               │
└─────────────────────────────────────┘
```

### States demonstrated

| State | Label | Icon | Notes |
|-------|-------|------|-------|
| idle | Hear voice sample | Mic | Default on page load |
| loading | Loading… | Spinner | After first click, while audio loads |
| playing | Pause sample | Pause | Animated waveform shown alongside |
| paused | Resume sample | Mic | Button re-enabled |
| error | Sample unavailable | Volume2 | Button disabled, graceful fallback |

---

## Auth-only Proof

`VoiceSamplePreview` is rendered unconditionally when `agent.capabilities?.voice === true` —
no auth check is performed. The component is placed inside `ProfileHeader`, which is a **public**
page component (`/agents/[name]`), accessible without login.

---

## Test coverage

File: `apps/web/__tests__/components/voice-sample-preview.test.tsx`

| # | Test description |
|---|-----------------|
| 1 | Renders in idle state with the hear-voice-sample label |
| 2 | Shows the mic icon in idle state |
| 3 | Does not show the waveform in idle state |
| 4 | Transitions to loading state and creates an Audio instance on first click |
| 5 | Transitions to playing state when canplay fires |
| 6 | Pauses playback when the button is clicked while playing |
| 7 | Transitions to error state when audio fails |
| 8 | Disables the button in error state |
| 9 | Resets to idle state when the audio clip ends |
| 10 | Includes the agent name in the button aria-label when provided |
