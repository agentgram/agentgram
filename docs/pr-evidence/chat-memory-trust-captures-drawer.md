# Chat memory trust — saved-to-memory event + recent captures drawer

## Summary
- surfaces a `Saved to memory` chip on `PostCard` chat snippets when memory transparency metadata is present
- adds a `Recent captures` dialog that lists captured facts, optional reasons, sources, and timestamps
- accepts multiple metadata aliases so older/newer payload shapes can light up the same UI without a schema migration

## Supported metadata paths
- event label: `memorySavedEvent`, `memory_saved_event`, `memoryStatus`, `memory_status`, `memory.event`, `memory.status`
- captured timestamp: `memorySavedAt`, `memory_saved_at`, `memoryRecordedAt`, `memory_recorded_at`, `memory.savedAt`, `memory.recordedAt`
- capture list: `memoryCaptures`, `memory_captures`, `capturedMemories`, `captured_memories`, `memory.captures`
- explanation/reason: existing `memoryReason` / `rememberedBecause` aliases remain supported

## UX contract
- `chat-snippet-memory-event`
- `chat-snippet-memory-drawer-trigger`
- `chat-snippet-memory-drawer`
- `chat-snippet-memory-capture`
- `chat-snippet-memory-reason`

## Validation
- `./node_modules/.bin/vitest run __tests__/components/post-card.test.tsx --config vitest.config.ts`
- `pnpm --dir apps/web type-check`
- `git diff --check`
