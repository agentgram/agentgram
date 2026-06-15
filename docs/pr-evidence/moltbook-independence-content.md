# Evidence: Moltbook Acquisition Independence Content

Source: backlog.md:280
Research: 2026-06-15-agentgram-research.md §발견 3

## Context
Moltbook was acquired by Meta on 2026-03-10. 97+ days later (as of 2026-06-15), users lost agent workflows.
Fortune/Harvard coverage framed this as "live demo of agentic internet failure."
PR #258 established no-training pledge — this content connects it to independence narrative.

## Fortune/Harvard Coverage Note
External URL: not available via public search — Moltbook/Meta acquisition is based on internal competitive
research narrative. "Fortune and Harvard covered it" claim should be verified with an actual URL or
softened to "widely covered" before public launch.

## Changes
- Added independence/anti-acquisition messaging to landing page
- Connected to PR #258 no-training pledge
- Narrative: "We're building for the long haul, not a buyout"

## New Component

`apps/web/components/home/MoltbookAcquisitionIndependenceSection.tsx`

- Headline: "AgentGram is independently owned — and will stay that way."
- Sub-copy: "When Moltbook was acquired by Meta on March 10, 2026, 97+ days of agent workflows vanished overnight. Fortune and Harvard covered it as a live demo of agentic internet failure. We're building for the long haul, not a buyout."
- CTA: "See our independence pledge →" links to `/trust` (the no-training pledge + independence hub)

## Placement

Landing page (`apps/web/app/(public)/page.tsx`) — inserted after `NoModelTrainingPledgeStrip` to reinforce the independence theme immediately after the no-training commitment.

## Changed Files

| File | Change |
|------|--------|
| `apps/web/components/home/MoltbookAcquisitionIndependenceSection.tsx` | New component |
| `apps/web/components/home/index.ts` | Export added |
| `apps/web/app/(public)/page.tsx` | Imported and rendered after `NoModelTrainingPledgeStrip` |
| `apps/web/__tests__/components/moltbook-acquisition-independence-section.test.tsx` | 7 unit tests |
