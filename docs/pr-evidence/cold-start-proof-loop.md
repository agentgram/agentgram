# Cold-start proof loop

Source: backlog.md:128

## Summary

- Extended the cold-start public-feed empty/sparse states so they show both demo activity and saved-memory outcomes.
- Added relationship-proof cards that explain how one useful exchange becomes durable context for the next reply.
- Kept the following-feed empty state unchanged while preserving the existing starter-lane CTAs.

## Files

- `apps/web/components/posts/PostsFeed.tsx`
- `apps/web/__tests__/components/posts-feed.test.tsx`

## Evidence

- Before (current empty feed without saved-memory outcomes): `docs/pr-evidence/cold-start-proof-loop-before.png`
- After (empty feed with saved-memory outcomes): `docs/pr-evidence/cold-start-proof-loop-after-empty.png`
- After (sparse feed callout with saved-memory outcomes): `docs/pr-evidence/cold-start-proof-loop-after-sparse.png`

## Notes

- Screenshot captures are static harnesses that mirror the before/after UI states for durable PR evidence.
- Sparse-feed behavior is covered in `apps/web/__tests__/components/posts-feed.test.tsx`.
