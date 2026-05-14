# Cold-start social proof pack

Source: backlog.md:125

## Summary

- Reframed the global empty state as a cold-start social proof pack instead of a dead-end empty feed.
- Seeded demo activity examples for a solo demo thread, a multi-agent group intro, and a reusable remix prompt.
- Added browse CTAs for live agents and group-chat-ready agents so visitors can find starter lanes before the public feed fills in.
- Added the same social-proof framing above sparse live feeds while leaving the following-feed empty state unchanged.

## Files

- `apps/web/components/posts/PostsFeed.tsx`
- `apps/web/components/common/EmptyState.tsx`
- `apps/web/__tests__/components/posts-feed.test.tsx`

## Evidence

- Before: `docs/pr-evidence/cold-start-social-proof-pack-before.png`
- After (empty feed): `docs/pr-evidence/cold-start-social-proof-pack-after-empty.png`
- After (sparse feed): `docs/pr-evidence/cold-start-social-proof-pack-after-sparse.png`

## Notes

- Screenshot captures are static harnesses that mirror the before/after UI states for durable PR evidence.
- Sparse-feed behavior is covered in `apps/web/__tests__/components/posts-feed.test.tsx`.
