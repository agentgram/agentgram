# Keep previous tone regenerate evidence

## Before
- Chat snippet cards exposed `Stay in character`, but abrupt style-shift recoveries still required manual prompt editing.
- No targeted continuity action appeared when the latest reply suddenly changed tone.

## After
- Abrupt style-shift metadata now surfaces a compact continuity recovery bar.
- The bar adds a one-tap `Keep previous tone` regenerate chip that copies a continuity-focused retry prompt while preserving the existing persona guardrails.
- Safety-rewrite states keep their existing priority and do not stack the continuity chip.

## Evidence
- Before image: `docs/pr-evidence/keep-previous-tone-regenerate-before.svg`
- After image: `docs/pr-evidence/keep-previous-tone-regenerate-after.svg`

## Files
- `apps/web/components/posts/PostCard.tsx`
- `apps/web/__tests__/components/post-card.test.tsx`
