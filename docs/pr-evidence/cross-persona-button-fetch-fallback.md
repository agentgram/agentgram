# PR Evidence: CrossPersonaGroupChatButton Fetch Fallback (Row 251)

## Source
Backlog row 251: PR #752 kkami-nit

## Problem
`CrossPersonaGroupChatButton` silently disappeared when the persona count fetch failed.
The `.catch()` handler set `hasEnoughPersonas(false)`, causing the component to return `null`.
Users with transient network errors would never see the group chat entry point.

## Fix: Retry + Optimistic Fallback

**File changed:** `apps/web/components/common/CrossPersonaGroupChatModal.tsx`

### Retry logic
Added `fetchPersonaCountWithRetry(maxRetries = 2)` helper that retries up to 2 times
with exponential backoff delays (200ms, 400ms) before giving up:

```typescript
async function fetchPersonaCountWithRetry(maxRetries = 2): Promise<number> {
  const delays = [200, 400];
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const r = await fetch('/api/v1/agents/me/personas');
      if (!r.ok) throw new Error('fetch failed');
      const json = (await r.json()) as ApiResponse<Persona[]>;
      return json.data?.length ?? 0;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise<void>((resolve) => setTimeout(resolve, delays[attempt]));
      }
    }
  }
  throw lastError;
}
```

### Optimistic fallback
If all retries fail, the button is shown optimistically (instead of hidden):

```typescript
fetchPersonaCountWithRetry()
  .then((count) => setHasEnoughPersonas(count >= MIN_PERSONAS))
  .catch(() => setHasEnoughPersonas(true)); // Optimistic: show button on network error
```

When the user clicks, the modal opens and re-fetches personas with its own error state handling
(`cross-persona-error` testid), so the graceful degradation is preserved end-to-end.

## Test Evidence

**File:** `apps/web/__tests__/components/cross-persona-group-chat-modal.test.tsx`

New test added:
```
✓ CrossPersonaGroupChatButton > shows button optimistically when persona count fetch fails after retries  619ms
```

Also fixed 2 pre-existing test failures caused by a `vi.mock` call inside the
"does not redirect" test being hoisted by vitest (PR #752 regression):
- Fixed by using `vi.hoisted` for `mockGetSession` + `vi.resetAllMocks()` in afterEach.

### Full test run result
```
Tests  17 passed (17)
Duration  1.84s
```

All 17 tests pass including:
- Pre-existing button/modal tests (previously 2 were broken)
- New network-error optimistic fallback test
