# Proactive send-window status evidence

## Before
- Settings page exposed opt-in, caps, quiet hours, and tone preset only.
- Developers could not see when AgentGram last sent a proactive message.
- Developers could not see the next eligible send window derived from quiet hours / opt-in state.

## After
- Settings page now shows **Last proactive send** with the latest stored outbound timestamp when available.
- Settings page now shows **Next eligible send window** using stored scheduling metadata or a quiet-hours fallback derived from the current settings.
- Empty states stay explicit: no prior send yet / waiting for opt-in.

## Example state
- `lastAutoMessageAt: 2026-04-27T01:30:00.000Z`
- `quietHoursStart: 22:00`
- `quietHoursEnd: 08:00`
- rendered next eligible window: `Apr 27, 2026, 8:00 AM KST`

## Screenshot
- Captured from a local evidence harness that renders the shipped `ProactiveControlsForm` state used by PR #501.
- Asset: `docs/pr-evidence/pr-501-proactive-send-window-status.png`
