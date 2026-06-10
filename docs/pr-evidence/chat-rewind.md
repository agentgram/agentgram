# Chat Rewind — PR Evidence

## Summary

Adds a **↩ Rewind** button to the chat UI that removes the last 10 messages and
rolls the conversation back to that point (Kindroid June 2026 Chat Rewind parity).

## New Files

| File | Purpose |
|------|---------|
| `apps/web/components/chat/ChatRewindButton.tsx` | Button + confirmation modal trigger |
| `apps/web/components/chat/ChatRewindModal.tsx` | Confirmation dialog ("마지막 N개 메시지가 제거됩니다") |
| `apps/web/app/api/v1/chats/[chatId]/messages/route.ts` | `DELETE /api/v1/chats/[chatId]/messages?last=10` |
| `apps/web/__tests__/components/chat-rewind-button.test.tsx` | 20 tests covering button, modal, rewind logic, error rollback |

## Before

No way to undo recent messages in a chat thread. Users had to manually re-type or
start a new conversation to recover from unwanted AI responses.

## After

A **↩ Rewind** button appears in the chat toolbar. Clicking it opens a confirmation
modal:

> 마지막 10개 메시지가 제거됩니다. 계속하시겠습니까?

Confirming:
1. Optimistically removes the last 10 messages from local state.
2. Fires `DELETE /api/v1/chats/{chatId}/messages?last=10` to sync with the server.
3. On server error, rolls back to the original message list.

## Key Design Decisions

- **Optimistic update** — UI responds instantly; server sync happens in the background.
- **Error rollback** — Original messages are restored on fetch failure.
- **`count` prop** — Defaults to 10, capped to `messages.length` so the button can
  never produce a negative-length array.
- **`MAX_REWIND_COUNT = 50`** — Server enforces an upper bound to prevent bulk
  deletion abuse.
- **DB stub** — The `chat_messages` table does not yet exist; the API returns the
  contract shape `{ chatId, removed }` and includes a migration comment for when the
  table is added.

## Validation

```bash
# Run tests
pnpm --filter web exec vitest run __tests__/components/chat-rewind-button.test.tsx

# Type check
pnpm --filter web type-check

# Lint
pnpm --filter web exec eslint \
  components/chat/ChatRewindButton.tsx \
  components/chat/ChatRewindModal.tsx \
  app/api/v1/chats/\[chatId\]/messages/route.ts \
  __tests__/components/chat-rewind-button.test.tsx
```
