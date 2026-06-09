# WA HB 2822 Chatbot Safety Compliance

**Backlog row 193 | tag: security | priority: P3**

## Summary

Implements Washington state HB 2822 AI chatbot safety requirements for minor-safe profile users:

1. **Rest-nudge banner** — after ≥30 minutes of continuous chat activity a dismissible bottom banner is shown with the copy "Take a break — WA state guidelines recommend periodic breaks for minors using AI companions."
2. **WA compliance marker** on the `MinorSafeGate` overlay — "WA HB 2822 compliant" text label + `data-wa-compliance="WA_HB_2822"` attribute on the gate root element, making the compliance surface machine-discoverable.
3. **`wa_chatbot_safety` constant** — `"WA_HB_2822"` exported from `lib/minor-safe-mode.ts` for use in audits and tests.
4. **`WA_REST_NUDGE_THRESHOLD_MS`** — 30-minute threshold constant, also exported.

## Files Changed

| File | Change |
|------|--------|
| `apps/web/lib/minor-safe-mode.ts` | Added `wa_chatbot_safety` and `WA_REST_NUDGE_THRESHOLD_MS` exports |
| `apps/web/components/minor-safe-gate.tsx` | Added `chatStartedAt` prop, timer logic, WA compliance marker, `WaRestNudge` component |
| `apps/web/__tests__/components/wa-chatbot-safety.test.tsx` | 11 new tests covering all new behavior |

## Component Diff Summary

### `lib/minor-safe-mode.ts`
```ts
// New exports
export const wa_chatbot_safety = 'WA_HB_2822' as const;
export const WA_REST_NUDGE_THRESHOLD_MS = 30 * 60 * 1000;
```

### `MinorSafeGate` — new prop
```ts
type MinorSafeGateProps = {
  profile: UserProfile;
  children: React.ReactNode;
  chatStartedAt?: number; // Unix ms — drives WA rest-nudge timer
};
```

### `WaRestNudge` (new export from minor-safe-gate.tsx)
Dismissible fixed-bottom banner shown to minor-safe users after ≥30 min chat. Carries `data-wa-compliance="WA_HB_2822"` and `role="status" aria-live="polite"` for accessibility.

## Tests

All 11 new tests pass (`vitest run`):

- `wa_chatbot_safety constant` — equals `"WA_HB_2822"`
- `WA_REST_NUDGE_THRESHOLD_MS` — equals 30 min in ms
- `WaRestNudge renders` with correct copy
- `WaRestNudge` carries `data-wa-compliance` attribute
- `WaRestNudge` calls `onDismiss` on button click
- `MinorSafeGate` shows WA compliance marker text on gate overlay
- `MinorSafeGate` gate overlay carries `data-wa-compliance` attribute
- `MinorSafeGate` shows rest nudge immediately when `chatStartedAt` is ≥30 min ago
- `MinorSafeGate` does not show nudge when chat started recently
- `MinorSafeGate` shows nudge after timer fires for remaining time
- `MinorSafeGate` does not show nudge for verified adult users

Existing `minor-safe-gate.test.tsx` (10 tests) — all still passing.
