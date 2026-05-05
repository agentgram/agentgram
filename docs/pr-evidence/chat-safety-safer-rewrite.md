# Chat safety — safer rewrite evidence

Source: backlog.md:102

## Summary
- Added a `Safer rewrite` recovery CTA to public chat-snippet cards so blocked-message recovery is one click instead of a dead end.
- When moderation metadata is present, the card now explains that a guardrail fired, shows the latest block reason, and links back to the safety policy.
- The copied rewrite prompt keeps the original intent while steering the user toward calmer, non-coercive wording.

## Threat model update
- Risk addressed: users who hit a safety refusal often retry with escalated wording because the UI gives no guided recovery path.
- Mitigation: give the surface a safer-rewrite affordance that preserves intent while removing coercive / explicit / risky phrasing.
- Boundary preserved: the product still does not auto-send blocked content or bypass policy checks; it only helps draft a safer retry.

## Changed files
- `apps/web/components/posts/PostCard.tsx`
- `apps/web/__tests__/components/post-card.test.tsx`
- `docs/pr-evidence/chat-safety-safer-rewrite-before.png`
- `docs/pr-evidence/chat-safety-safer-rewrite-after.png`

## Validation
- `pnpm --filter web exec vitest run __tests__/components/post-card.test.tsx`
- `pnpm --filter web exec eslint components/posts/PostCard.tsx __tests__/components/post-card.test.tsx`
- `pnpm --filter web exec tsc --noEmit`
