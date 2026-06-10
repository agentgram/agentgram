# PR Evidence: Nomi Voice Latency Parity Stat

**Branch:** feat/nomi-voice-latency-stat  
**Date:** 2026-06-10  
**Backlog row:** 214

## Context

Nomi V3 launched in 2026 with 1–1.5s voice response latency as a key marketing claim.
This PR adds a "< 2s voice response" latency stat badge to the voice plan upgrade CTA and
agent capability pages, establishing AgentGram's Nomi V3 parity position in product copy.

---

## New Component

### `apps/web/components/agents/VoiceLatencyStatBadge.tsx`

A marketing stat badge that surfaces the sub-2s voice latency claim inline with the voice
upgrade CTA. Mirrors the `VoiceRetentionUpliftBadge` layout pattern (green tier, Zap icon,
attribution line).

**Props:** `{ className?: string }`  
**Test ID:** `voice-latency-stat-badge`  
**Stat copy:** `< 2s voice response`  
**Attribution:** `Nomi V3 parity`  
**Tooltip:** `Voice responses under 2 seconds — matches Nomi V3's 1–1.5s benchmark`

---

## Before / After Placement

### `apps/web/components/subscription/PaywallPreviewModal.tsx`

**Before** — only `VoiceRetentionUpliftBadge` shown after "Voice responses" feature row:

```tsx
{feature.title === 'Voice responses' && (
  <VoiceRetentionUpliftBadge className="mt-1.5" />
)}
```

**After** — `VoiceLatencyStatBadge` added alongside `VoiceRetentionUpliftBadge`:

```tsx
{feature.title === 'Voice responses' && (
  <div className="mt-1.5 flex flex-wrap gap-2">
    <VoiceRetentionUpliftBadge />
    <VoiceLatencyStatBadge />
  </div>
)}
```

---

### `apps/web/components/agents/ProfileHeader.tsx`

**Before** — only `VoiceRetentionUpliftBadge` shown in voice capabilities section:

```tsx
<VoiceRetentionUpliftBadge className="mt-2" />
```

**After** — `VoiceLatencyStatBadge` added alongside `VoiceRetentionUpliftBadge`:

```tsx
<div className="mt-2 flex flex-wrap gap-2">
  <VoiceRetentionUpliftBadge />
  <VoiceLatencyStatBadge />
</div>
```

---

## Test Coverage

**File:** `apps/web/__tests__/components/voice-latency-stat-badge.test.tsx`  
**Tests:** 6

| # | Test | Assertion |
|---|------|-----------|
| 1 | renders badge container | `data-testid="voice-latency-stat-badge"` present |
| 2 | displays latency stat | `< 2s voice response` text |
| 3 | displays Nomi V3 attribution | `Nomi V3 parity` text |
| 4 | tooltip references benchmark | `title` matches Nomi V3 benchmark copy |
| 5 | renders zap icon | `data-testid="voice-latency-stat-icon"` present |
| 6 | accepts custom className | class applied to badge container |
