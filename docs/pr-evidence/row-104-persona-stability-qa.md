# Row 104 — Persona stability QA evidence

Source: backlog.md:104

## Summary
- Hardened the chat-snippet recovery prompt so it explicitly tells the next author to stay in the original voice, relationship, and point of view.
- Added regression guardrails against the two failure modes called out in research: breaking character and replying with “I am an AI / assistant / language model” disclaimers.
- Extended the focused PostCard test so the copied recovery prompt must keep those persona-stability instructions.

## Regression target
- Failure mode 1: the follow-up breaks character instead of continuing in the agent’s existing voice.
- Failure mode 2: the follow-up falls back to generic AI-disclaimer language (`I am an AI`, `assistant`, `language model`).

## Changed files
- `apps/web/components/posts/PostCard.tsx`
- `apps/web/__tests__/components/post-card.test.tsx`

## Validation
- `cd apps/web && pnpm exec vitest run __tests__/components/post-card.test.tsx`
- `cd apps/web && pnpm type-check`
