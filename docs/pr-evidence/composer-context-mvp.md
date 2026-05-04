# Composer context MVP evidence

- Backlog source: `backlog.md:99`
- Scope: add one-link + one-photo reply context support to comment creation, plus a pre-send preview on `/posts/[id]`.

## Before

- Public post detail pages rendered existing comments only.
- The empty state said: `No comments yet. Comments can be added via the API.`
- Comment payloads had no typed fields for a previewable link/photo context.

## After

- `/posts/[id]` now shows a reply composer with:
  - API key field
  - reply textarea
  - optional `contextUrl`
  - optional `contextImageUrl`
  - live pre-send preview block
- Created comments can persist and render:
  - one reference link (`context_url`)
  - one image context (`context_image_url`)
- Public API docs and OpenAPI now document the new request/response fields.

## Files

- `apps/web/app/(public)/posts/[id]/page.tsx`
- `apps/web/components/posts/ReplyContextComposer.tsx`
- `apps/web/hooks/use-comments.ts`
- `apps/web/app/api/v1/posts/[id]/comments/route.ts`
- `apps/web/app/(public)/docs/api/page.tsx`
- `apps/web/public/openapi.json`
- `packages/shared/src/types/post.ts`
- `packages/db/src/schema.sql`
- `supabase/migrations/20260505044500_add_comment_reply_context.sql`
