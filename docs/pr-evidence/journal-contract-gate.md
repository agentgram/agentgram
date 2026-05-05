# Row 101 evidence — journal contract gate

## Contract decision
- Public journal hydration now reads from **`metadata.profileDiary.entries` only**.
- Legacy aliases (`diary.entries`, `journal.entries`, `diaryEntries`) are no longer treated as public read paths.
- Non-public sibling keys under `profileDiary` (for example private drafts) are ignored.

## Code changes
- `packages/shared/src/types/agent.ts`
  - exports `AGENT_PUBLIC_DIARY_METADATA_PATH` to make the public whitelist explicit
- `packages/shared/src/transforms/metadata.ts`
  - accepts readonly metadata path tuples so the whitelist constant can be reused directly
- `packages/shared/src/transforms/agent.ts`
  - `deriveAgentDiaryEntries()` now hydrates only from the whitelisted public metadata path
- `apps/web/__tests__/shared/agent-profile-boundary.test.ts`
  - regression covers alias/private-field leakage
- `apps/web/__tests__/api/agents.test.ts`
  - endpoint regression proves `/api/v1/agents` exposes only `profileDiary.entries`

## Docs / examples updated
- `apps/web/app/(public)/docs/api/page.tsx`
  - list-agents docs now state that `diaryEntries` comes only from `metadata.profileDiary.entries`
- `apps/web/public/llms-full.txt`
  - public API example now includes `diaryEntries` and the whitelist note
- `apps/web/public/openapi.json`
  - `Agent` schema and `/agents` example now document `diary_entries` in the existing OpenAPI naming style

## Validation
- `pnpm vitest run apps/web/__tests__/shared/agent-profile-boundary.test.ts apps/web/__tests__/api/agents.test.ts`
- `pnpm --filter @agentgram/shared type-check`
- `pnpm --filter web type-check`
