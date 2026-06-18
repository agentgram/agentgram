# First-Message Intent Wizard

**Branch**: `feat/first-message-intent-wizard`
**Date**: 2026-06-19
**Backlog row**: 318
**Tag**: ux

## What Was Built

A 2-step "tone + topic" selector shown before the first message send on any new
conversation. Eliminates blank-start anxiety — the blank composer is a known
friction point (Replika has this issue) where users don't know how to open. The
wizard surfaces intent framing before the first keystroke.

Distinct from StarterPromptStrip (PR #817), which offers pre-written prompts
after the conversation has already opened. This wizard shapes the session
_before_ anything is typed.

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/chat/FirstMessageIntentWizard.tsx` | New component — 2-step wizard (tone then topic) that pre-fills composer with selected context |
| `apps/web/__tests__/components/first-message-intent-wizard.test.tsx` | 7 unit tests covering rendering, step transitions, prefill string format, and skip behavior |

## Component Design

### Props

```ts
interface FirstMessageIntentWizardProps {
  /** Whether this is the first message in the conversation. Shows wizard only when true. */
  isFirstMessage: boolean;
  /** Called when both steps complete; receives the pre-fill string to append to the composer. */
  onComplete: (prefill: string) => void;
  /** Called when the user skips the wizard entirely. */
  onDismiss: () => void;
}
```

### Step 1 — Tone

Chips: `Casual`, `Supportive`, `Playful`, `Serious`, `Creative`

Selecting a chip advances to Step 2. Each chip has `data-testid="tone-chip-{tone}"`.

### Step 2 — Topic

Chips: `Just chatting`, `Roleplay`, `Creative writing`, `Study help`, `Emotional support`

Selecting a chip calls `onComplete` with a prefill string in the format:
`[{Tone} / {Topic}] ` (e.g. `[Casual / Just chatting] `)

### Skip behavior

A "Skip" button is visible in both steps. Clicking it calls `onDismiss` without
populating the composer. The wizard is never shown again for that conversation
because the parent controls `isFirstMessage` and sets it to false after the
first send.

## UX Flow

**Before (blank-start friction)**:
```
User opens new chat → stares at empty composer → doesn't know how to start → drops off
```

**After (with wizard)**:
```
User opens new chat
→ wizard appears above composer: "What tone are you in the mood for?"
→ user taps "Casual"
→ wizard updates: "What would you like to talk about?" (Tone: Casual)
→ user taps "Just chatting"
→ composer pre-filled: "[Casual / Just chatting] "
→ user types their message and sends
```

## Test Coverage

7 tests in `first-message-intent-wizard.test.tsx`:

1. Renders nothing when `isFirstMessage` is false
2. Renders step 1 tone chips when `isFirstMessage` is true
3. Advances to step 2 with topic chips after selecting a tone
4. Displays selected tone label in step 2
5. Calls `onComplete` with correct prefill string after tone + topic selection
6. Calls `onDismiss` when skip is clicked on step 1
7. Calls `onDismiss` when skip is clicked on step 2

All 7 tests pass (`pnpm --filter web exec vitest run` — 1 file, 7 tests, 0 failures).

## Integration Notes

Mount `<FirstMessageIntentWizard>` above the message composer in the chat page,
passing `isFirstMessage={messages.length === 0}`. On `onComplete`, prepend the
prefill string to the composer value. On `onDismiss` or after first send, the
parent re-evaluates `isFirstMessage` as false and the wizard disappears.

Auth-gating is inherited from the existing chat route — no additional auth work
required.
