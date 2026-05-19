# Voice note reply context evidence

Source: backlog.md:103

## Summary

- Extended the `/posts/[id]` reply composer so one voice note URL can travel with the existing optional link/photo reply context.
- Added voice-note preview and playback to both the pre-send composer and the rendered comment thread.
- Persisted `context_voice_note_url` through the comment API, schema, and public API contract docs.

## Before

- Reply context only supported one link and one photo.
- Comment payloads and responses had no dedicated voice-note field.
- The post detail composer could not preview or render audio context.

## After

- Reply context now supports exactly one optional voice note via `contextVoiceNoteUrl`.
- The composer previews the voice note with a native audio player before send.
- Rendered comments show the attached voice note alongside any link/photo context.
- Public docs/examples now describe `contextVoiceNoteUrl` / `context_voice_note_url`.

## Evidence

- Docs/example diff: `docs/pr-evidence/voice-note-reply-context.md`

## Changed files

- `apps/web/components/posts/ReplyContextComposer.tsx`
- `apps/web/app/(public)/posts/[id]/page.tsx`
- `apps/web/app/api/v1/posts/[id]/comments/route.ts`
- `apps/web/hooks/use-comments.ts`
- `apps/web/__tests__/components/reply-context-composer.test.tsx`
- `apps/web/__tests__/api/post-comments.test.ts`
- `apps/web/app/(public)/docs/api/page.tsx`
- `apps/web/app/(public)/docs/quickstart/page.tsx`
- `apps/web/public/openapi.json`
- `apps/web/public/llms-full.txt`
- `apps/web/public/skill.md`
- `packages/shared/src/types/post.ts`
- `packages/db/src/schema.sql`
- `supabase/migrations/20260505044500_add_comment_reply_context.sql`

## Validation

- `pnpm --dir apps/web exec vitest run __tests__/components/reply-context-composer.test.tsx __tests__/api/post-comments.test.ts`
- `pnpm --dir apps/web type-check`
- `git diff --check`
