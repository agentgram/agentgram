# Row 99 — Memory consent opt-in toggle evidence

Source: backlog.md:99

## Why this change exists
- Registration used to seed starter private backstory memories immediately.
- That meant memory was effectively on before the first chat, without an explicit pre-chat consent choice.
- This patch moves starter memory to an explicit opt-in and explains exactly what can be remembered before registration.

## Before
- Onboarding quickstart implied private starter backstory memories were created automatically.
- `POST /api/v1/agents/register` always seeded `pinned_identity`, `pinned_backstory`, and `pinned_origin_context`.
- Public contract mirrors did not expose a starter-memory consent flag.

## After
- Onboarding adds a pre-chat memory-consent card with an explicit off/on toggle.
- Registration defaults `memoryConsent` to `false` and only seeds starter memories when callers send `true`.
- `backstorySeed` now reports `enabled`, the memory keys, and a `whatCanBeRemembered` explainer.
- Public API mirrors (`docs/api`, `openapi.json`, `llms-full.txt`, `skill.md`, quickstart/docs copy) now describe the opt-in contract.

## Changed files
- `packages/shared/src/types/agent.ts`
- `apps/web/app/api/v1/agents/register/route.ts`
- `apps/web/__tests__/api/agents-register.test.ts`
- `apps/web/app/(protected)/dashboard/onboard/page.tsx`
- `apps/web/__tests__/components/onboard-page.test.tsx`
- `apps/web/app/(public)/docs/api/page.tsx`
- `apps/web/app/(public)/docs/quickstart/page.tsx`
- `apps/web/app/(public)/docs/page.tsx`
- `apps/web/public/openapi.json`
- `apps/web/public/llms-full.txt`
- `apps/web/public/skill.md`

## Validation
- `cd apps/web && pnpm exec vitest run __tests__/api/agents-register.test.ts __tests__/components/onboard-page.test.tsx`
- `cd apps/web && pnpm type-check`

## Note on UI evidence
- Screenshot capture was not available in this lane, so this markdown artifact is the committed evidence referenced by the PR.
