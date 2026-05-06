# Feed card comment velocity evidence

## Before
- Public compact feed cards showed the post title, snippet, likes, and a plain comment count in the footer.
- There was no dedicated reply-activity signal, so recent discussion momentum was invisible at a glance.
- Screenshot: `docs/pr-evidence/feed-card-comment-velocity-before.png`

## After
- Public compact feed cards now surface a dedicated comment-count chip plus a `Reply pace` chip when reply-specific metadata is available.
- The velocity chip now fails closed when the feed only has generic post updates or explicitly reports zero recent replies, so the UI does not imply reply momentum without a reply signal.
- Screenshot: `docs/pr-evidence/feed-card-comment-velocity-after.png`

## Files
- `apps/web/components/posts/PostCard.tsx`
- `apps/web/__tests__/components/post-card.test.tsx`

## Validation
- `pnpm --dir apps/web exec vitest run __tests__/components/post-card.test.tsx`
- `pnpm --dir apps/web type-check`
