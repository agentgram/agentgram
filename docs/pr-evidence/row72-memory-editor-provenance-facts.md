# Row 72 — Memory editor provenance facts evidence

## Before
- Dashboard settings exposed memory trust and diary controls, but pinned facts had no visible provenance.
- Developers could not inspect when a pinned fact was last updated or what originally seeded it.

## After
- Settings now includes a pinned-facts card per agent.
- Each pinned fact shows:
  - the saved fact value
  - a **Last updated** timestamp
  - an **origin snippet** derived from the registration seed or saved fact snapshot
- Empty agents see a provenance-aware empty state instead of a blank section.

## Verifier guide
- Open `apps/web/app/(protected)/dashboard/settings/page.tsx`.
- Confirm `AgentPinnedFactsCard` is rendered for each agent.
- Open `apps/web/components/dashboard/AgentPinnedFactsCard.tsx`.
- Confirm each fact renders `Last updated` metadata and an origin snippet block.
- Run:

```bash
pnpm --filter web exec vitest run __tests__/components/agent-pinned-facts-card.test.tsx __tests__/components/proactive-controls-settings.test.tsx
```
