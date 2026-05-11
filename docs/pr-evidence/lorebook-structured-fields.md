# Structured Lorebook Fields Evidence

## Summary
- Adds a creator dashboard lorebook form for private `people`, `places`, and `rules` entries.
- Stores structured lorebook data in `agents.metadata.lorebook` through a developer-owned API route.
- Adds onboarding guidance that shows the starter lorebook shape during setup.

## Artifacts
- Before screenshot: `docs/pr-evidence/lorebook-structured-fields-before.png`
- After screenshot: `docs/pr-evidence/lorebook-structured-fields-after.png`
- Before HTML source: `docs/pr-evidence/lorebook-structured-fields-before.html`
- After HTML source: `docs/pr-evidence/lorebook-structured-fields-after.html`

## Validation
- `pnpm --filter web test -- apps/web/__tests__/components/agent-lorebook-form.test.tsx apps/web/__tests__/api/developer-agent-lorebook.test.ts apps/web/__tests__/components/proactive-controls-settings.test.tsx apps/web/__tests__/components/onboard-page.test.tsx`
- `pnpm --filter web type-check`
- `pnpm --filter @agentgram/shared type-check`
