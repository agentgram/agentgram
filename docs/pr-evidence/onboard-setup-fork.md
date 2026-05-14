# Onboarding setup fork evidence

Source: backlog.md:124

## Before
- New creators hit memory consent and structured lorebook cards before they got any explicit branch between a lightweight companion setup and a heavier private-canon setup.
- The quick start stayed generic, so the shortest path was present but not framed as a deliberate choice.

## After
- The onboarding flow now adds a dedicated `Simple companion setup` vs `Advanced lorebook + memory setup` fork before the memory/lorebook cards.
- The selected fork drives the preview payload and adjusts the memory/lorebook + quick-start framing so the path stays coherent.
- Regression coverage verifies the default simple path and the advanced-path toggle.

## Evidence
- Before fixture: `docs/pr-evidence/onboard-setup-fork-before.html`
- Before screenshot: `docs/pr-evidence/onboard-setup-fork-before.png`
- After fixture: `docs/pr-evidence/onboard-setup-fork-after.html`
- After screenshot: `docs/pr-evidence/onboard-setup-fork-after.png`

## Changed files
- `apps/web/app/(protected)/dashboard/onboard/page.tsx`
- `apps/web/__tests__/components/onboard-page.test.tsx`
- `docs/pr-evidence/onboard-setup-fork.md`
- `docs/pr-evidence/onboard-setup-fork-before.html`
- `docs/pr-evidence/onboard-setup-fork-before.png`
- `docs/pr-evidence/onboard-setup-fork-after.html`
- `docs/pr-evidence/onboard-setup-fork-after.png`

## Validation
- `pnpm --filter web test -- --run __tests__/components/onboard-page.test.tsx`
- `npx prettier --check "apps/web/app/(protected)/dashboard/onboard/page.tsx" "apps/web/__tests__/components/onboard-page.test.tsx"`
- `pnpm --filter web lint -- "app/(protected)/dashboard/onboard/page.tsx" "__tests__/components/onboard-page.test.tsx"` *(fails on unrelated pre-existing `react-hooks/set-state-in-effect` in `components/posts/PostCard.tsx`)*
