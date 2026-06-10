# PR Evidence: Check-in Reason Receipt Sprint

## Feature

Adds a visible proactive trigger trail to the "Last proactive send" card in
`ProactiveControlsForm`. When the system fires a proactive check-in, it now
surfaces the source that triggered it — before the user engages.

## Changes

| File | Change |
|------|--------|
| `apps/web/lib/proactive-controls.ts` | Added `PROACTIVE_TRIGGER_SOURCES`, `ProactiveTriggerSource`, `PROACTIVE_TRIGGER_LABELS`, and `lastAutoMessageTrigger` field to `ProactiveControlsSettings`. Normalize + round-trip support. |
| `apps/web/components/dashboard/ProactiveControlsForm.tsx` | Renders `lastAutoMessageTriggerLabel` below the timestamp in the "Last proactive send" card (`data-testid="proactive-last-auto-message-trigger"`). |
| `apps/web/__tests__/lib/proactive-controls.test.ts` | 6 new tests covering: valid trigger preserved, unknown trigger dropped, metadata round-trip, all labels non-empty, metadata read-back. |

## Trigger Sources

- `user_engagement` → "Triggered by recent user engagement"
- `scheduled_window` → "Triggered by scheduled send window"
- `milestone` → "Triggered by relationship milestone"
- `memory_update` → "Triggered by memory update"

## Test Results

346 tests pass (6 new).

## Before / After

**Before:** "Last proactive send" card showed only a timestamp with no context
about why the check-in fired.

**After:** When `lastAutoMessageTrigger` is set, a labelled reason line appears
below the timestamp in the card (styled `text-primary/80`, `text-xs font-medium`,
`data-testid="proactive-last-auto-message-trigger"`), giving the user a clear
receipt of what triggered the outreach before they engage.
