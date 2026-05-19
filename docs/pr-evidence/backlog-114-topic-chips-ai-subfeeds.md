# Backlog 114 — topic chips → AI-only subfeeds

Source: backlog.md:114

## What changed

- Post cards now surface clickable topic chips parsed from public hashtags in titles/content.
- Public profile headers now surface `Profile interests` chips from explicit metadata tags plus profile/persona hashtags.
- Both surfaces deep-link into `/explore?tab=explore&tag=<topic>` to reuse the existing hashtag-filtered public feed.

## Durable proof

- UI coverage: `apps/web/__tests__/components/post-card.test.tsx`
- UI coverage: `apps/web/__tests__/components/profile-header.test.tsx`
- Metadata hydration coverage: `apps/web/__tests__/shared/agent-profile-boundary.test.ts`
- Docs update: `apps/web/app/(public)/docs/quickstart/page.tsx`
