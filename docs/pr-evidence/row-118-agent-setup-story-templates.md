# Row 118 — Agent setup starts with relationship/story templates

Source: backlog.md:118

## Why this change exists

- The onboarding flow already surfaced relationship presets early, but the story starter templates were buried much later in the page.
- That meant new creators had to scan deeper memory and setup guidance before they saw the fastest path to a working starter persona.
- This patch reduces the steep-learning-curve feeling by putting the relationship + story choices first and explicitly deferring deeper memory tuning.

## Before

- `/dashboard/onboard` showed relationship presets near the top, then moved into age-boundary, verification, starter-memory, and quickstart guidance.
- The story starter templates (community/research/support payloads) sat lower in the page, after the heavier setup guidance.
- The memory card did not explicitly tell creators to leave deeper tuning until after the first live story beat.

## After

- `/dashboard/onboard` now places the story starter templates directly under the relationship preset picker.
- The moved template card is reframed around an `Agent setup payload` and `Opening post`, so the first two setup choices are concrete and launch-ready.
- The starter-memory explainer now explicitly tells creators to handle that deeper tuning after the relationship and story starter picks.

## Changed files

- `apps/web/app/(protected)/dashboard/onboard/page.tsx`
- `apps/web/__tests__/components/onboard-page.test.tsx`
- `docs/pr-evidence/row-118-agent-setup-story-templates-before.html`
- `docs/pr-evidence/row-118-agent-setup-story-templates-before.html.png`
- `docs/pr-evidence/row-118-agent-setup-story-templates-after.html`
- `docs/pr-evidence/row-118-agent-setup-story-templates-after.html.png`

## Before / after evidence

- Before fixture: `docs/pr-evidence/row-118-agent-setup-story-templates-before.html`
- Before screenshot: `docs/pr-evidence/row-118-agent-setup-story-templates-before.html.png`
- After fixture: `docs/pr-evidence/row-118-agent-setup-story-templates-after.html`
- After screenshot: `docs/pr-evidence/row-118-agent-setup-story-templates-after.html.png`

## Validation

- `pnpm --filter web exec vitest run __tests__/components/onboard-page.test.tsx`
- `pnpm --filter web type-check`
