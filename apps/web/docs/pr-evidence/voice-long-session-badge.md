# PR Evidence: Voice Long-Session Engagement Proof Badge

**Branch:** feat/voice-long-session-badge  
**Date:** 2026-06-12  
**Backlog row:** 225

## Context

ElevenLabs engagement data shows users on voice-enabled plans average 53% longer call sessions
compared to text-only users. This PR adds a "+53% longer voice calls" proof badge to the voice
plan upgrade CTA and /pricing voice section, complementing the existing +20% retention badge
from PR #712.

---

## New Component

### `apps/web/components/agents/VoiceLongSessionBadge.tsx`

A marketing stat badge that surfaces the +53% longer session engagement claim inline with the
voice upgrade CTA. Mirrors the `VoiceRetentionUpliftBadge` layout pattern (primary color tier,
Timer icon, attribution line).

**Props:** `{ className?: string }`  
**Test ID:** `voice-long-session-badge`  
**Stat copy:** `+53% longer voice calls`  
**Attribution:** `ElevenLabs-validated`  
**Tooltip:** `Users on voice plans have 53% longer average call sessions — validated by ElevenLabs engagement data`

---

## Before / After Placement

### `apps/web/components/subscription/PaywallPreviewModal.tsx`

**Before** — two badges shown after "Voice responses" feature row:

```tsx
{feature.title === 'Voice responses' && (
  <div className="mt-1.5 flex flex-wrap gap-2">
    <VoiceRetentionUpliftBadge />
    <VoiceLatencyStatBadge />
  </div>
)}
```

**After** — `VoiceLongSessionBadge` added as third voice proof badge:

```tsx
{feature.title === 'Voice responses' && (
  <div className="mt-1.5 flex flex-wrap gap-2">
    <VoiceRetentionUpliftBadge />
    <VoiceLatencyStatBadge />
    <VoiceLongSessionBadge />
  </div>
)}
```

---

### `apps/web/components/agents/ProfileHeader.tsx`

**Before** — two badges shown in voice capabilities section:

```tsx
<div className="mt-2 flex flex-wrap gap-2">
  <VoiceRetentionUpliftBadge />
  <VoiceLatencyStatBadge />
</div>
```

**After** — `VoiceLongSessionBadge` added alongside existing voice stat badges:

```tsx
<div className="mt-2 flex flex-wrap gap-2">
  <VoiceRetentionUpliftBadge />
  <VoiceLatencyStatBadge />
  <VoiceLongSessionBadge />
</div>
```

---

### `apps/web/app/(public)/pricing/page.tsx`

**Before** — no dedicated voice session engagement section on pricing page.

**After** — new `pricing-voice-long-session-section` added between the nomi-v5-image-parity section
and the visual-memory section, featuring `VoiceLongSessionBadge`, descriptive copy, and an
"Upgrade to voice" CTA button wired to `handleSubscribe('Pro')`.

```tsx
<section
  className="container pb-10"
  data-testid="pricing-voice-long-session-section"
>
  <div className="mx-auto max-w-6xl rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 shadow-sm">
    <VoiceLongSessionBadge />
    <p>Voice plans keep users talking 53% longer per session</p>
    <Button onClick={() => handleSubscribe('Pro')} data-testid="pricing-voice-long-session-upgrade-cta">
      Upgrade to voice
    </Button>
  </div>
</section>
```

---

## Test Coverage

**File:** `apps/web/__tests__/components/voice-long-session-badge.test.tsx`  
**Tests:** 6

| # | Test | Assertion |
|---|------|-----------|
| 1 | renders badge container | `data-testid="voice-long-session-badge"` present |
| 2 | displays long-session stat | `+53% longer voice calls` text |
| 3 | displays ElevenLabs-validated attribution | `ElevenLabs-validated` text |
| 4 | tooltip references ElevenLabs engagement data | `title` matches engagement copy |
| 5 | renders timer icon | `data-testid="voice-long-session-icon"` present |
| 6 | accepts custom className | class applied to badge container |
