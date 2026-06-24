# PR Evidence: Session Wellness Nudge

## Backlog Row
180

## Summary
Adds a dismissible inline wellbeing card (`SessionWellnessNudge`) that surfaces in the chat thread after sustained heavy use. Distinct from the keyword-based crisis overlay (PR #656 / SB 243 compliance).

## Before
No client-side session-intensity check for message volume. The existing `WellbeingNudgeCard` (PR #754) fires after 60 minutes elapsed time only, uses component state (resets on page reload), and is displayed as a fixed bottom overlay.

## After
`SessionWellnessNudge` fires after **either**:
- 60+ messages sent in the current session, **or**
- 90+ minutes of continuous session time

Shown **inline** in the chat thread (not a fixed overlay). Uses `sessionStorage` so it displays at most once per browser session, surviving re-renders and component remounts within the same tab.

## Files Changed
| File | Change |
|------|--------|
| `apps/web/hooks/use-session-wellness.ts` | New hook — tracks both message count and elapsed time, reads/writes `sessionStorage` |
| `apps/web/components/chat/SessionWellnessNudge.tsx` | New component — inline dismissible card |
| `apps/web/__tests__/components/session-wellness-nudge.test.tsx` | 15 tests covering all threshold/dismiss/sessionStorage paths |
| `apps/web/hooks/index.ts` | Added exports for new hook and constants |

## Research Basis
CHI 2026 Aalto University study on heavy AI companion users showing elevated loneliness/depression signals after sustained sessions. The dual threshold (message count + time) captures both rapid back-and-forth exchanges and slower, longer-running sessions.

## Test Coverage
- Renders nothing below threshold (message count and time)
- Renders after message threshold (60 messages)
- Renders after time threshold (90 minutes) via fake timers
- Dismiss hides card and writes sessionStorage flag
- Does not reshow after dismiss within the same session
- Does not render when sessionStorage flag already set on mount
- Resource link present/absent variants
- Constant value assertions
