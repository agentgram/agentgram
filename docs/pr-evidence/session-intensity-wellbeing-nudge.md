# Session-Intensity Wellbeing Nudge — PR Evidence

## Summary

Adds a `WellbeingNudgeCard` that surfaces a "Time for a break" banner after a
user has been in a continuous chat session for **≥60 minutes**. The card is
dismissable and does not reappear for the remainder of the session.

## Source

Backlog row 180 — 2026-06-13-agentgram-research.md §핵심 발견 3

## New Files

| File | Purpose |
|------|---------|
| `apps/web/components/common/WellbeingNudgeCard.tsx` | Dismissable banner card with optional resource link; exports `WELLBEING_NUDGE_THRESHOLD_MS = 3_600_000` |
| `apps/web/hooks/use-session-timer.ts` | Hook that fires `shouldShowNudge` after the threshold elapses; supports custom `thresholdMs` and `sessionStartedAt` |
| `apps/web/components/chat/ChatSessionNudge.tsx` | Thin wrapper wiring the hook to the card; drop-in for any chat page |
| `apps/web/__tests__/components/wellbeing-nudge-card.test.tsx` | 14 unit tests covering render, dismiss, constant value, and hook timer logic |

## Before

No mechanism existed to prompt users to take a break after sustained chat
sessions. Heavy users could remain in conversation indefinitely with no
wellbeing signal.

## After

`ChatSessionNudge` can be mounted inside any chat layout. After 60 continuous
minutes:

1. `useSessionTimer` fires `shouldShowNudge = true`.
2. `WellbeingNudgeCard` appears as a fixed bottom-center banner.
3. Clicking ×  calls `dismissNudge()`, hiding the card and preventing it
   from re-firing for the rest of the session.
4. An optional `resourceUrl` prop renders an external wellness link.

## Key Design Decisions

- **Threshold constant** `WELLBEING_NUDGE_THRESHOLD_MS = 3_600_000` is
  exported so callers can reference or override it without magic numbers.
- **`sessionStartedAt` prop** allows the parent to pass the real session start
  time (e.g. from server props), so the 60-minute window is accurate across
  hard navigations.
- **Pattern match** — component visual style mirrors the existing `WaRestNudge`
  in `minor-safe-gate.tsx` (amber → emerald for semantic differentiation).
- **14 tests** cover: card renders, heading/body text, dismiss callback, resource
  link presence/absence/attributes, constant value, hook fires at threshold,
  hook fires immediately when session already exceeded threshold, dismiss
  prevents re-fire.

## Auth-only Proof

N/A — component is client-side render only; no authenticated endpoints touched.

## Validation

```bash
# Run tests
pnpm --filter web exec vitest run __tests__/components/wellbeing-nudge-card.test.tsx

# Type check
pnpm --filter web type-check

# Lint
pnpm --filter web exec eslint \
  components/common/WellbeingNudgeCard.tsx \
  components/chat/ChatSessionNudge.tsx \
  hooks/use-session-timer.ts \
  __tests__/components/wellbeing-nudge-card.test.tsx
```
