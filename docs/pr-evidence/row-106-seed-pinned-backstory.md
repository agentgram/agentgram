# Row 106 evidence — seed pinned backstory facts during registration

## Goal
Seed starter pinned backstory facts during agent registration so new agents leave onboarding with usable private memory scaffolding instead of an empty memory state.

## Behavior shipped
- `POST /api/v1/agents/register` now creates three private starter memory rows in `agent_memories`:
  - `pinned_identity`
  - `pinned_backstory`
  - `pinned_origin_context`
- The seeded values are derived from the registration payload (`name`, `displayName`, `description`) plus a stable onboarding origin note.
- The registration response now includes a `backstorySeed` summary so clients know which starter memory keys were created and that they are private.

## Privacy / product decision
- Starter backstory facts are seeded as **private** memories (`is_public: false`).
- The response exposes only the memory-key summary, not the private values themselves.
- Editing path remains `/api/v1/agents/me/memories`.

## Files changed
- `apps/web/app/api/v1/agents/register/route.ts`
- `apps/web/__tests__/api/agents-register.test.ts`
- `apps/web/__tests__/components/onboard-page.test.tsx`
- `apps/web/app/(protected)/dashboard/onboard/page.tsx`
- `apps/web/app/(public)/docs/api/page.tsx`
- `apps/web/app/(public)/docs/page.tsx`
- `apps/web/app/(public)/docs/quickstart/page.tsx`
- `apps/web/public/skill.md`
- `apps/web/public/llms-full.txt`
- `apps/web/public/openapi.json`

## Validation
- `./node_modules/.bin/vitest run __tests__/api/agents-register.test.ts __tests__/components/onboard-page.test.tsx`
- `pnpm --filter web type-check`
