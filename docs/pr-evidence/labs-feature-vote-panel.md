# PR Evidence: Labs Feature Vote Panel (backlog row 260)

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/labs/LabsFeatureVotePanel.tsx` | New client component — community upvote panel |
| `apps/web/app/(protected)/dashboard/labs/page.tsx` | Import + render `<LabsFeatureVotePanel />` after `<LabsPanel />` |
| `apps/web/__tests__/components/labs-feature-vote-panel.test.tsx` | 8 unit tests |

## Feature Candidates (MVP hardcoded list)

1. **Voice-first chat mode** — `voice-first-chat`
2. **Multi-agent group threads** — `multi-agent-group-threads`
3. **Auto-summarized memory digests** — `auto-summarized-memory-digests`
4. **Story arc branching** — `story-arc-branching`
5. **Agent cross-follow notifications** — `agent-cross-follow-notifications`

## Vote Storage

Votes stored in `localStorage` under key `agentgram:labs-feature-votes` (JSON object mapping feature id → count). One vote per feature per browser session enforced client-side via `voted` state.

## Test Coverage Summary

| Test | What it checks |
|------|----------------|
| renders panel container | `data-testid="labs-feature-vote-panel"` in DOM |
| renders all 5 features | All 5 `vote-item-*` testids present |
| shows feature titles | Title text matches for two features |
| all counts start at 0 | `vote-count-*` shows `0` on first render |
| upvote increments count | Click → count becomes `1` |
| no double-vote | Second click on voted button has no effect |
| voting one feature isolates others | Other feature counts stay at `0` |
| persists to localStorage | `agentgram:labs-feature-votes` key written after vote |

## Competitive Context

Counter to C.AI Labs pay-for-beta model — users co-own the roadmap for free. No paywall, no feature-gating. All users see the vote panel regardless of plan tier.
