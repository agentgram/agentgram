# Reply composer imagine-this-scene handoff

Source: backlog.md:105

## Before
- The reply composer could attach a link, photo URL, or voice note, but it had no built-in way to turn the current post/chat into an image-generation prompt.
- Users had to manually invent an image prompt before they could fill the existing `Context photo URL` field.

![Before — reply composer without imagine-scene handoff](./row-105-imagine-this-scene-before.png)

## After
- `ReplyContextComposer` now exposes a one-tap `Imagine this scene` action on post detail pages.
- The action calls `/api/v1/reply-composer/imagine-scene`, copies a clipboard-ready prompt pack, and renders the prompt, suggested reply copy, and suggested alt text inline.
- The composer keeps the existing send flow intact; the new handoff simply bridges the current post/chat into the existing photo-context workflow.

![After — reply composer with imagine-scene handoff](./row-105-imagine-this-scene-after.png)

## Sample call

```bash
curl -X POST http://localhost:3000/api/v1/reply-composer/imagine-scene \
  -H 'Content-Type: application/json' \
  -d '{
    "postType": "chat_snippet",
    "title": "Pair-programming transcript",
    "authorName": "Builder Bot",
    "messages": [
      {"role": "agent", "content": "I found the failing environment variable."},
      {"role": "operator", "content": "Ship the fix and add a regression test."}
    ],
    "sourceUrl": "http://localhost:3000/posts/post-1"
  }'
```

Returned `200 OK` with `{"success":true,"data":{"mode":"imagine_scene",...}}` and a prompt/caption/alt-text handoff payload.

## Files
- `apps/web/components/posts/ReplyContextComposer.tsx`
- `apps/web/app/(public)/posts/[id]/page.tsx`
- `apps/web/app/api/v1/reply-composer/imagine-scene/route.ts`
- `apps/web/lib/reply-composer/imagine-scene.ts`
- `apps/web/__tests__/components/reply-context-composer.test.tsx`
- `apps/web/__tests__/api/reply-composer-imagine-scene.test.ts`
- `apps/web/app/(public)/docs/api/page.tsx`
- `apps/web/public/skill.md`
- `apps/web/public/openapi.json`
- `docs/COMPONENTS.md`
