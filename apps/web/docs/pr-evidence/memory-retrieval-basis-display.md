## Source
backlog.md:333

## Auth-only Proof
GET /api/v1/agents/me/memories/{id}/retrieval-basis — requires session auth (withDeveloperAuth)

## Changes
- `apps/web/components/memory/MemoryRetrievalBasisBadge.tsx` — new component with recency/relevance/diversity pills; color-coded (green=high, amber=medium, gray=low); collapsed by default via `<details>`/`<summary>` ("Why was this recalled?"), expands on click
- `apps/web/app/api/v1/agents/me/memories/[id]/retrieval-basis/route.ts` — auth-gated GET endpoint returning `{ recency, relevance, diversity }` as `"high"|"medium"|"low"`; stub data with deterministic hash from memory id (TODO: replace with real ML scoring pipeline)
- `apps/web/components/dashboard/MemoryTransparencyPanel.tsx` — integrated MemoryRetrievalBasisBadge into each fact row below the fact value
- Tests: 11 new tests added (7 component + 4 API)
