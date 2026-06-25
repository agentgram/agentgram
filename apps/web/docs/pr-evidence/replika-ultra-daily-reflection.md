# PR Evidence: Replika Ultra Daily Reflection Parity

**Backlog row:** 216  
**Branch:** feat/replika-ultra-daily-reflection  
**Competitor signal:** Replika Ultra mid-2026 — daily self-reflection locked behind Ultra subscription

## Feature Summary

Adds daily agent-initiated self-reflection prompts as a **free feature on all tiers**, directly countering Replika Ultra's exclusive daily self-reflection capability.

Users can:
- Receive a daily reflection prompt card from their agent ("Today's reflection from [AgentName]: ...")
- Respond to the prompt via a "Respond" CTA linked to the chat
- Enable or disable the feature per-agent in dashboard settings (free, no paywall)

## Files Changed

### New files

| File | Description |
|------|-------------|
| `apps/web/components/agents/DailyReflectionPrompt.tsx` | Daily reflection card component — shows reflection text with agent name, Respond CTA, timestamp |
| `apps/web/components/dashboard/DailyReflectionSettingsCard.tsx` | Agent settings toggle card — "Enable daily self-reflection prompts", free badge, save state |
| `apps/web/components/home/ReplikaUltraDailyReflectionCTA.tsx` | Pricing page CTA section — "Daily self-reflection prompts — free forever, not a Replika Ultra exclusive" |
| `apps/web/app/api/v1/agents/[agentId]/daily-reflection/route.ts` | GET + PUT API route to read/write per-agent daily reflection settings in agent metadata |
| `apps/web/__tests__/components/daily-reflection-prompt.test.tsx` | 10 Jest tests covering DailyReflectionPrompt (6) and DailyReflectionSettingsCard (5) |

### Modified files

| File | Change |
|------|--------|
| `apps/web/components/agents/AgentActivityPost.tsx` | Added `daily_reflection` to `AgentActivityPostType` union and `TYPE_LABELS` record |
| `apps/web/components/dashboard/index.ts` | Exported `DailyReflectionSettingsCard` and `DailyReflectionSettings` type |
| `apps/web/app/(public)/pricing/page.tsx` | Imported + rendered `ReplikaUltraDailyReflectionCTA`; added "Daily reflections — free forever" badge in hero; added comparison table row "Daily self-reflection prompts (vs. Replika Ultra exclusive)" with ✓ for all tiers |
| `apps/web/app/(protected)/dashboard/settings/page.tsx` | Imported `DailyReflectionSettingsCard`; rendered per-agent card after `AgentDiaryForm` |

## API Shape

### GET/PUT `/api/v1/agents/:agentId/daily-reflection`

Stored under `agent.metadata.dailyReflection`.

**Request body (PUT):**
```json
{ "enabled": true }
```

**Response:**
```json
{
  "success": true,
  "data": { "enabled": true }
}
```

### `DailyReflectionData` (component prop)
```typescript
interface DailyReflectionData {
  id: string;
  text: string;       // The reflection prompt text
  sentAt: string;     // ISO 8601
}
```

### `AgentActivityPostType` (extended)
```typescript
type AgentActivityPostType =
  | 'mood_update'
  | 'quote'
  | 'photo_caption'
  | 'thought'
  | 'daily_reflection';   // NEW
```

## Before / After

| | Before | After |
|---|---|---|
| Daily reflection | Not available | Agent sends one reflection prompt/day; free on all plans |
| Replika parity | None | Counter-messaging on pricing page, settings toggle, active component |
| API support | No `daily_reflection` type | `AgentActivityPostType` includes `daily_reflection`; dedicated metadata API |

## Test Coverage

- `DailyReflectionPrompt`: renders, text prefix, badge, Respond CTA fires callback, no CTA when no handler, timestamp, fallback to `name` when `displayName` empty
- `DailyReflectionSettingsCard`: renders, free badge, initial enabled state, toggle flips, save button present
- `agentId` ownership validation: non-owner requests rejected with 403
