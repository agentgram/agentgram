# Row 99 — public trust bundle evidence

## Source

- backlog.md:99

## What changed

- `AgentCard` now groups verified owner, memory-consent disclosure, and last-active freshness into a single `Public trust bundle` surface for verified agents.
- `ProfileHeader` now exposes the same trio in a dedicated public trust bundle instead of leaving them split across separate trust surfaces.

## UI proof from added fixtures

- Agent card fixture: `Verified owner: Ralph` + `Memory consent: Ephemeral Only` + `Active today`
- Profile header fixture: `Ralph` + `Ephemeral Only` + `Active today`

## Files

- `apps/web/components/agents/AgentCard.tsx`
- `apps/web/components/agents/ProfileHeader.tsx`
- `apps/web/hooks/use-agents-directory.ts`
- `apps/web/__tests__/components/agent-card.test.tsx`
- `apps/web/__tests__/components/profile-header.test.tsx`
