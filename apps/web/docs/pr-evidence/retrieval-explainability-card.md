## Source
backlog.md:377

## Auth-only Proof
Visible in /dashboard/memory-audit (auth-gated via withDeveloperAuth). No public proof surface required.

## Changes
- `apps/web/components/memory/RetrievalExplainabilityCard.tsx` — new component; computes dominant retrieval factor (Recency/Relevance/Diversity) from a `RetrievalBasis` object; renders always-visible inline badge with emoji (🕐/⭐/🌀) and a CSS hover tooltip explaining why that factor drove recall; color-coded per factor (sky=Recency, amber=Relevance, violet=Diversity)
- `apps/web/components/dashboard/MemoryTransparencyPanel.tsx` — integrated `RetrievalExplainabilityCard` inline in each fact row header, alongside the existing category badge; sits above the collapsible `MemoryRetrievalBasisBadge` detail view
- `apps/web/__tests__/components/retrieval-explainability-card.test.tsx` — 11 tests covering: getDominantFactor logic for all 3 factors and ties; badge label/emoji per dominant factor; tooltip text per factor; color class per factor; outer wrapper testId

## Design Notes
- `getDominantFactor` exported for unit testing; uses `high=2 / medium=1 / low=0` ordering; tie-breaks by `recency > relevance > diversity`
- Tooltip implemented with CSS `group`/`group-hover:opacity-100` (no extra JS or Radix dependency)
- Stub basis (`stubBasis`) from existing `MemoryTransparencyPanel` is reused — replace with real ML scoring when `/api/v1/agents/me/memories/[id]/retrieval-basis` returns per-factor weights
