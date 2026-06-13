# PR Evidence: Memory Bulk-Delete Impact Preview + Export Gate

**Source:** backlog.md:236  
**Tag:** ux  
**PR:** feat/memory-bulk-delete-impact-preview

---

## Problem (Before)

When a user attempted a bulk memory wipe, the deletion executed immediately with no preview or escape hatch. There was no indication of how many memories or sessions would be affected, and no opportunity to export before losing data permanently.

**Before state:**
- Bulk delete triggered a direct API call with no intermediate confirmation step
- No impact summary ("you'll lose X memories across Y sessions")
- No one-tap export CTA to preserve data before deletion
- Users who accidentally confirmed had no recourse (no undo)

---

## Solution (After)

Three new files implement the guard pattern:

### `apps/web/components/memory/MemoryBulkDeleteImpactCard.tsx`

A confirmation card rendered **before** any bulk deletion is executed. It shows:

- **Impact summary**: "You'll lose X memories across Y sessions. This action cannot be undone."
- **One-tap export CTA**: "Export all memories" → links to `/dashboard/data-export`
- **Proceed with deletion** button (destructive red)
- **Cancel** button (two entry points: X icon and "Cancel" text button)

Singular/plural labels are handled correctly ("1 memory / 1 session" vs "N memories / N sessions").

### `apps/web/hooks/useMemoryBulkDeleteGuard.ts`

A React hook that intercepts the bulk delete action:

1. `triggerBulkDelete()` — call this instead of the raw delete function; shows the impact card
2. `showImpactCard` — boolean to conditionally render `MemoryBulkDeleteImpactCard`
3. `impact` — `{ memoryCount, sessionCount }` derived from the memories array
4. `confirm()` — user confirmed; hides the card and calls `onConfirmedDelete()`
5. `cancel()` — user dismissed; hides the card without deleting

Session count is derived from distinct `agentId` values across the memories array.

### Test Coverage

| File | Tests |
|------|-------|
| `__tests__/components/memory/MemoryBulkDeleteImpactCard.test.tsx` | 14 tests — impact count rendering, singular/plural, export href, confirm/cancel callbacks |
| `__tests__/hooks/useMemoryBulkDeleteGuard.test.ts` | 9 tests — initial state, count computation, trigger/confirm/cancel flow, re-trigger after cancel |

---

## Export CTA Route

The export CTA points to `/dashboard/data-export` (PR #684, existing page), which provides JSON and CSV export of all memories. This satisfies GDPR Article 20 (right to data portability) before Article 17 (right to erasure).

---

## Integration Pattern

```tsx
// In any component with bulk delete
const { triggerBulkDelete, showImpactCard, impact, confirm, cancel } =
  useMemoryBulkDeleteGuard(memories, handleBulkDelete);

return (
  <>
    <Button onClick={triggerBulkDelete}>Delete all memories</Button>

    {showImpactCard && (
      <MemoryBulkDeleteImpactCard
        memoryCount={impact.memoryCount}
        sessionCount={impact.sessionCount}
        onConfirm={confirm}
        onCancel={cancel}
      />
    )}
  </>
);
```
