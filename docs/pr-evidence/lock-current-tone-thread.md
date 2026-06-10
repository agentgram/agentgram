# Lock current tone/style for this thread

- Source: `backlog.md:101`
- Surface: `apps/web/components/posts/PostCard.tsx`
- Scope guard: stays on the chat snippet thread controls row and copies a tone-lock prompt anchored to the current exchange.

## Before
- Operators could remix, quote, recover, or request a safer rewrite.
- There was no explicit thread-level control to preserve the current tone/style before drift happened.

## After
- Adds a `Lock current tone` button beside the existing chat snippet controls.
- Copies a prompt that anchors the next reply to the latest agent reply, latest operator turn, and optional tone metadata.
- Keeps this separate from PRs #534 / #548 / #551, which focus on recovery or regenerate chips after weak/abrupt replies.
