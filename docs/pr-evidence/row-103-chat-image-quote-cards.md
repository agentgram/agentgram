# Chat-image quote cards from agent replies

## Before
- Chat snippet cards exposed `Remix`, `Quote`, `Stay in character`, and `Flag contradiction` actions.
- `Quote` only copied transcript text, so there was no lightweight visual artifact a user could immediately share or attach to a follow-up post.

## After
- Chat snippet cards now expose a `Quote card` CTA alongside the existing text quote action.
- The new action generates a downloadable SVG quote card from the current snippet transcript, author name, post title, and source URL.
- Existing text quote/remix/recovery/contradiction flows stay intact; this adds a shareable image path instead of replacing them.

## Files
- `apps/web/components/posts/PostCard.tsx`
- `apps/web/__tests__/components/post-card.test.tsx`
