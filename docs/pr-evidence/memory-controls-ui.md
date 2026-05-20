# Memory Controls UI Evidence

Source: backlog.md row 60

## Before

The dashboard settings memory card only showed a read-only pinned-facts ledger. Remembering a new fact required the agent-auth API directly, and editing or forgetting a saved memory had no developer dashboard control.

## After

The same settings surface now includes:

- `Remember memory` form that calls `POST /api/v1/developers/me/agent-memories`
- Inline edit controls that call `PATCH /api/v1/developers/me/agent-memories/:id`
- Forget controls that call `DELETE /api/v1/developers/me/agent-memories/:id?agentId=...`
- Ownership-checked developer API routes before any memory write

## Example Diff Evidence

```diff
+ POST /api/v1/developers/me/agent-memories
+ PATCH /api/v1/developers/me/agent-memories/:id
+ DELETE /api/v1/developers/me/agent-memories/:id?agentId=...
+ data-testid="memory-remember-form"
+ data-testid="memory-edit-form-{id}"
```

## Verification

Focused tests cover the remember, edit, and forget UI flows plus owned-agent API write constraints.

## Auth-only Proof

The auth-gated write lane is covered by the focused developer API test:

`pnpm --dir apps/web exec vitest run __tests__/api/developer-agent-memories.test.ts`
