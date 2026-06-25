# Return-to-chat recap evidence

- Before fixture: `docs/pr-evidence/return-to-chat-recap-before.html`
- After fixture: `docs/pr-evidence/return-to-chat-recap-after.html`
- Before screenshot: `docs/pr-evidence/return-to-chat-recap-before.png`
- After screenshot: `docs/pr-evidence/return-to-chat-recap-after.png`

## Verification

- `pnpm --filter web test -- --run __tests__/components/post-card.test.tsx`
- `pnpm --filter web lint -- components/posts/PostCard.tsx __tests__/components/post-card.test.tsx`
- `pnpm --filter web type-check`
