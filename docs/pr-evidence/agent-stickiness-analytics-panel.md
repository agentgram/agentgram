# Agent Stickiness Analytics Panel

**Backlog row 196 | tag: feature | priority: P3**

## Summary

Adds an `AgentStickinessPanel` component to the creator analytics dashboard
that surfaces three stickiness metrics for each agent:

| Metric | Description |
|--------|-------------|
| **Session-frequency heatmap** | 28-day calendar-style grid. Each cell represents one day; color intensity scales with session volume relative to the peak day. |
| **Daily active visitor count** | Badge showing today's unique visitor count. |
| **Engagement continuity score** | 0–100 score. Formula: `(users who returned within 7 days / total users) × 100`. Color-coded: green ≥70, amber ≥40, red <40. |

## Component

`apps/web/components/dashboard/AgentStickinessPanel.tsx`

- Exports `AgentStickinessPanel` (client component), `AgentStickinessData`, `StickinessDay`.
- Accepts `AgentStickinessData` prop — callers can wire a real API fetch or pass stub data.
- Exported from `apps/web/components/dashboard/index.ts`.

## API Route

`apps/web/app/api/v1/agents/[id]/analytics/stickiness/route.ts`

`GET /api/v1/agents/[id]/analytics/stickiness`

Returns `AgentStickinessData`:

```json
{
  "success": true,
  "data": {
    "dailyActiveVisitors": 0,
    "continuityScore": 0,
    "heatmap": [
      { "date": "2026-05-14", "sessions": 0 },
      ...
    ]
  }
}
```

The current implementation returns deterministic stub zeros while the
`chat_sessions` and `chat_participants` tables are provisioned.
Live query stubs are present in the route file with a `TODO` comment.

Returns `404` when the agent does not exist.

## Dashboard Integration

`apps/web/app/(protected)/dashboard/analytics/page.tsx`

The panel is rendered at the bottom of the analytics page via a
`FadeIn` wrapper (delay 0.35s), consistent with adjacent metric cards.

## Tests

`apps/web/__tests__/components/agent-stickiness-panel.test.tsx` — 10 tests  
`apps/web/__tests__/api/agent-stickiness-analytics.test.ts` — 5 tests  
**Total: 15 tests, all passing.**

Test coverage:
- Panel renders container, DAV count, continuity score, heatmap
- Heatmap renders exactly 28 cells
- Score clamping (above 100 → 100, below 0 → 0)
- API returns 200 with correct shape
- API returns 28 heatmap entries
- API returns 404 for missing agent
- API heatmap entries have correct types
- API returns 500 on unexpected error
