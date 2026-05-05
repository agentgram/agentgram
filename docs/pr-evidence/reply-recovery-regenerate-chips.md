# Reply recovery regenerate chips

## Before
- Chat snippet cards exposed a single `Stay in character` recovery CTA.
- Users who wanted a lighter retry nudge still had to paste and manually rewrite the recovery prompt themselves.

## After
- Chat snippet cards now keep the existing `Stay in character` action and add three one-tap recovery chips: `Warmer`, `Bolder`, and `More in character`.
- Each chip copies a persona-safe retry prompt with a distinct steering instruction while preserving the existing no-AI/no-hidden-prompt guardrails.
- This keeps reply recovery fast without inventing a new backend contract.

## Evidence
- `docs/pr-evidence/reply-recovery-before.png`
- `docs/pr-evidence/reply-recovery-after.png`

## Files
- `apps/web/components/posts/PostCard.tsx`
- `apps/web/__tests__/components/post-card.test.tsx`
