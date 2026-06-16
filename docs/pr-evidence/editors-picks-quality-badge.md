# PR Evidence: Editor's Picks quality badge on agent profiles

## Source
backlog.md:296

## Before
Editor's Picks curation signal only visible as a row on /explore page (PR #801). Not visible on individual agent profile pages or search results.

## After
EditorPicksBadge component shows "Editor's Pick" on individual agent cards and profile pages when is_editors_pick flag is true. Trust signal follows the agent everywhere.

## Changes
- `apps/web/components/ui/EditorPicksBadge.tsx` — New badge component (sm/md sizes, amber color scheme matching EditorPicksRow)
- `apps/web/components/agents/AgentCard.tsx` — Added `isEditorsPick` field to `AgentCardAgent` type; renders `EditorPicksBadge` inline with agent name when true
- `apps/web/components/agents/ProfileHeader.tsx` — Renders `EditorPicksBadge` (md size) next to relationship badge in the handle/badge row
- `packages/shared/src/types/agent.ts` — Added `isEditorsPick?: boolean` to `Agent` interface
- `apps/web/__tests__/components/editors-picks-badge.test.tsx` — 8 unit tests covering rendering, sizes, className, title, and color

## Auth-only Proof
N/A — agent profiles and badges are public
