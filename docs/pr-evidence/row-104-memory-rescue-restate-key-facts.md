# Row 104 — Memory rescue restate-my-key-facts evidence

Source: backlog.md:104

## Summary
- Detects low-context chat-snippet replies from explicit metadata or common fallback phrasing.
- Adds a `Memory rescue` banner directly under the low-context reply with a one-tap **Restate my key facts** action.
- Copies a recovery prompt that asks the agent to restate durable remembered facts before continuing, including visible memory cues when present.
- Adds focused PostCard regression coverage for the new CTA and clipboard prompt.

## Evidence assets
- Before: `docs/pr-evidence/row-104-memory-rescue-before.svg`
- After: `docs/pr-evidence/row-104-memory-rescue-after.svg`

## Validation
- `pnpm --dir apps/web exec vitest run __tests__/components/post-card.test.tsx`
- `pnpm --dir apps/web type-check`
