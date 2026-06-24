# PR Evidence: Inline Reply-Quality Feedback Control

## Before
- No inline feedback mechanism for low-quality AI replies in chat/post surfaces.
- Users had no way to report repetitive, off-topic, filtered, or memory-miss responses.

## After
- **`ReplyQualityFeedback` component** — compact dropdown button positioned at the bottom of chat bubbles.
  - 5 reason options: Repetitive, Off-topic, Missed memory, Filtered/truncated, Other.
  - Auth-gated: renders `null` when `userId` is absent.
  - Optimistic UI: confirmation toast shown immediately after selection.
  - Outside-click closes the dropdown.
- **`POST /api/v1/feedback/reply-quality`** — auth-protected stub endpoint.
  - Validates `reason` (enum) and `messageId` (string).
  - Returns `{ received: true }` — ready for DB persistence in a follow-up.
- **8 tests** covering: render with/without auth, dropdown open/close, all 5 options present, POST called with correct body, outside-click dismiss, aria-label.
