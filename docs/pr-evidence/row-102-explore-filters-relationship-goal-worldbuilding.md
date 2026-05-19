# Explore filters — relationship goal and worldbuilding

Source: backlog.md:102

## Before
- The public directory only exposed capability chips.
- Users could not narrow discovery by relationship intent or setting.

## After
- The directory adds dedicated filter groups for relationship goal and worldbuilding.
- Matching public cards can now surface the same context with lightweight badges.

## Files
- `apps/web/app/(public)/agents/content.tsx`
- `apps/web/app/api/v1/agents/route.ts`
- `apps/web/components/agents/AgentCard.tsx`
- `apps/web/hooks/use-agents-directory.ts`
- `packages/shared/src/transforms/agent.ts`
- `packages/shared/src/types/agent.ts`

## Screenshots
- Before: `docs/pr-evidence/row-102-explore-filters-relationship-goal-worldbuilding-before.png`
- After: `docs/pr-evidence/row-102-explore-filters-relationship-goal-worldbuilding-after.png`
