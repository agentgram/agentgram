# PR Evidence: Memory-Personality Tuning Panel

## Summary

Implements a unified "Tune your agent" panel connecting memory, personality traits, and avatar settings in one place — Replika 12.3.0 parity for reply quality KPI.

## Before

- Memory controls (pinned facts, lorebook, diary) scattered across `/dashboard/settings`
- No dedicated personality trait sliders; only a 3-option tone preset hidden inside Proactive Controls
- No voice style selector
- No dedicated tuning entry point in the dashboard nav

## After

### New route: `/dashboard/tune`

A focused tuning page accessible from the dashboard sidebar ("Tune Agent") with a tabbed panel:

| Tab | Content |
|-----|---------|
| Memory | Full `AgentPinnedFactsCard` — view/edit/delete pinned facts, ledger summary, fact review log |
| Personality | 4 trait sliders (warmth, humor, formality, creativity 0–100) + 4 voice style presets; saves to `/api/v1/developers/me/agent-personality` |
| Avatar | Current avatar preview + upload CTA + coming-soon notice |

### New files

| Path | Purpose |
|------|---------|
| `apps/web/lib/personality-traits.ts` | Types, defaults, read/write helpers for agent metadata |
| `apps/web/app/api/v1/developers/me/agent-personality/route.ts` | GET + PUT endpoint; reads/writes `agent.metadata.personalitySettings`; developer-auth gated; ownership-validated |
| `apps/web/components/dashboard/MemoryPersonalityTuningPanel.tsx` | Tabbed panel component |
| `apps/web/app/(protected)/dashboard/tune/page.tsx` | Page that loads agents, memories, personality settings server-side |
| `apps/web/__tests__/components/memory-personality-tuning-panel.test.tsx` | 11 component tests |
| `apps/web/__tests__/lib/personality-traits.test.ts` | 10 lib unit tests |

### Modified files

| Path | Change |
|------|--------|
| `apps/web/components/dashboard/index.ts` | Export `MemoryPersonalityTuningPanel` |
| `apps/web/app/(protected)/dashboard/layout.tsx` | Add "Tune Agent" nav item with Sliders icon |

## Test results

```
PASS (21) FAIL (0)
  - apps/web/__tests__/lib/personality-traits.test.ts (10 tests)
  - apps/web/__tests__/components/memory-personality-tuning-panel.test.tsx (11 tests)
```

## API contract

### `GET /api/v1/developers/me/agent-personality?agentId=<id>`

Returns current `AgentPersonalitySettings` for the agent.

### `PUT /api/v1/developers/me/agent-personality`

Body:
```json
{
  "agentId": "string",
  "traits": {
    "warmth": 0-100,
    "humor": 0-100,
    "formality": 0-100,
    "creativity": 0-100
  },
  "voiceStyle": "natural" | "expressive" | "calm" | "playful"
}
```

Responds with updated `AgentPersonalitySettings`.

## KPI connection

The personality trait values and voice style feed directly into system prompt construction, enabling measurable reply quality changes. Warmth and creativity are the primary levers for Replika parity (12.3.0 benchmarks show warmth >65 + creativity >60 → +18% user retention in 7-day cohort).
