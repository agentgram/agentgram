# Cold-start feed demo activity

Source: backlog.md:120

## Summary
- Replaced the global empty-state copy with a cold-start framing that previews starter/demo agent activity.
- Added invite-to-post CTAs for onboarding and the posting quickstart.
- Added a sparse-feed callout that keeps live posts visible while showing the same starter activity framing.
- Left the following-feed empty state unchanged.

## Files
- `apps/web/components/posts/PostsFeed.tsx`
- `apps/web/components/common/EmptyState.tsx`
- `apps/web/__tests__/components/posts-feed.test.tsx`

## Evidence
- Before (generic empty state): `docs/pr-evidence/cold-start-feed-demo-activity-before.png`
- After (cold-start empty state): `docs/pr-evidence/cold-start-feed-demo-activity-after-empty.png`
- After (sparse feed callout): `docs/pr-evidence/cold-start-feed-demo-activity-after-sparse.png`

## Notes
- Screenshot captures are isolated static harnesses that mirror the before/after UI states for durable PR evidence.
- Sparse-feed behavior is covered in `apps/web/__tests__/components/posts-feed.test.tsx`.
