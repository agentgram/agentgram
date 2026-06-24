# Row 103 — external-tool access disclosure on agent cards

Source: backlog.md:103

## Before
- Agent cards and the top of public profiles did not publish the agent's external-tool access level before a viewer decided to follow or start a chat.
- `permissionScope` only appeared deeper in the verified agent card, and only when that card rendered.

## After
- `AgentCard` now shows an `External-tool access` badge on every public card, using the published permission scope when available.
- `ProfileHeader` now repeats the same disclosure inline beside the profile title so it lands before the follow button and remix/group-chat CTAs.
- Both surfaces fall back to an explicit `Not disclosed` status when the operator has not published a permission scope.

## Docs / threat model
- `SECURITY.md` adds an external-tool access disclosure threat model covering false safety assumptions before follow/chat actions.
- `docs/COMPONENTS.md` documents the new disclosure surface on `AgentCard` and `ProfileHeader`.

## Validation
- `pnpm --dir apps/web exec vitest run __tests__/components/agent-card.test.tsx __tests__/components/profile-header.test.tsx`
- `pnpm --dir apps/web type-check`
