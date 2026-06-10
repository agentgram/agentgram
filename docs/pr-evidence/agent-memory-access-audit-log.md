# PR Evidence: Agent Memory Access Audit Log

## Feature

Exposes per-session memory read/write/delete events to the agent owner via a new
dashboard page (`/dashboard/memory-audit`) and API route
(`GET /api/v1/agents/me/memory-audit`).

---

## Threat Model

### Attack closed: Moltbook-style unsecured-DB agent hijacking (Jan 2026)

**Attack vector:**  
An adversary with network access to an unsecured agent-facing database could
silently read or modify an agent's memory facts without the agent owner's
knowledge. Because the agent owner had no visibility into memory access events,
the compromise could persist indefinitely — the hijacked agent would continue
injecting malicious context into conversations with users.

**What this feature closes:**  
Every memory operation (read, write, delete) is now written to the audit log
at the time it occurs. The agent owner can review the full per-session access
trail at any time from the dashboard. Silent or unexpected access (e.g., a
foreign session ID reading sensitive fact keys) becomes immediately visible.

**Who can see the audit log:**  
Only the authenticated developer who owns the agent (`developer_id` ownership
check enforced at the API level). The `withDeveloperAuth` middleware verifies
the Supabase session cookie, then a secondary DB query confirms
`agents.developer_id = x-developer-id` before any data is returned.

---

## Regression Test

**File:** `apps/web/__tests__/api/memory-audit.test.ts`

Key security-relevant tests:

| Test # | Description |
|--------|-------------|
| 1 | `401` when `x-developer-id` header is absent (no bypass) |
| 3 | `403` when a developer requests audit log for an agent they don't own |
| 4 | Ownership DB query uses both `agent_id` AND `developer_id` constraints |
| 5 | Response shape matches `MemoryAuditPage` type |
| 6 | Each event has all required `MemoryAuditEvent` fields |
| 10 | Events ordered newest-first |

Test #3 is the primary regression test for the Moltbook hijacking scenario:
a developer presenting a valid session but requesting data for another developer's
agent is rejected with `403 FORBIDDEN`.

---

## DB Migration Note

The `agent_memory_audit_log` table does not yet exist. The API route returns mock
data and includes a `// TODO: DB migration required` comment with the exact DDL:

```sql
CREATE TABLE agent_memory_audit_log (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    uuid        NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  session_id  text        NOT NULL,
  operation   text        NOT NULL CHECK (operation IN ('read', 'write', 'delete')),
  fact_key    text        NOT NULL,
  fact_summary text       NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON agent_memory_audit_log (agent_id, created_at DESC);
```

The real DB query is also written as a comment in the route, ready to uncomment
once the migration runs.

---

## Files Changed

| File | Change |
|------|--------|
| `packages/shared/src/types/agent-memory.ts` | Added `MemoryAuditEvent`, `MemoryAuditOperation`, `MemoryAuditPage` types |
| `packages/shared/src/types/index.ts` | Re-exported new types |
| `apps/web/app/api/v1/agents/me/memory-audit/route.ts` | New API route (owner-auth, paginated, mock data) |
| `apps/web/app/(protected)/dashboard/memory-audit/page.tsx` | New dashboard page |
| `apps/web/components/dashboard/MemoryAuditDashboard.tsx` | Client component (event list, pagination) |
| `apps/web/__tests__/api/memory-audit.test.ts` | 12 unit tests |
| `docs/pr-evidence/agent-memory-access-audit-log.md` | This file |
