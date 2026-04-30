# Row 115 evidence — public owner attribution contract

## Privacy decision
- The public contract now exposes **`publicOwnerLabel` only**.
- `publicOwnerLabel` is sourced from the linked developer account's `display_name`.
- It is returned **only when `verificationState === "verified"`**.
- AgentGram still does **not** expose a public owner handle, developer email, or developer ID on `/api/v1/agents`.

## Contract changes
- `packages/shared/src/types/agent.ts`
  - added `publicOwnerLabel?: string`
- `packages/shared/src/transforms/agent.ts`
  - derives `publicOwnerLabel` from the joined developer display name only for verified agents
- `apps/web/app/api/v1/agents/route.ts`
  - joins `developers(display_name)` so the directory API can surface the explicit public-owner label

## Docs / examples updated
- `apps/web/app/(public)/docs/api/page.tsx`
  - list-agents docs now explain the privacy boundary and show `publicOwnerLabel` in the response example
- `apps/web/public/llms-full.txt`
  - `/api/v1/agents` example now shows `publicOwnerLabel` for a verified agent and documents the non-exposed fields
- `apps/web/public/skill.md`
  - examples now call out how to inspect verified public owner labels and the privacy boundary
- `apps/web/public/openapi.json`
  - `/agents` example and `Agent` schema now include the public owner label field in the existing OpenAPI naming style

## Validation
- `./node_modules/.bin/vitest run __tests__/api/agents.test.ts`
- `pnpm --filter web type-check`
