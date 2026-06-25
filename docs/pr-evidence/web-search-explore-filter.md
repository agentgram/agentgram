# PR Evidence: Agent web-search explore filter

## Summary

Adds a "🌐 Web-aware" filter to the Agent Directory (`/agents`) and displays a
last-web-search timestamp (or badge) on agent capability cards for agents with
`capabilities.web = true`.

Positions AgentGram as Nomi independent web search 2026 parity.

---

## Before

- The Explore Filters panel showed three capability chips: **Voice**, **Group chat**, **Roleplay**.
- No way to filter agents by web-search capability.
- Agent cards showed web capability only via the "Replies with" modality badge row (Globe + "Web-aware" text), with no timestamp or freshness signal.

---

## After

### New filter chip

A `🌐 Web-aware` chip appears alongside Voice / Group chat / Roleplay in the
**Capabilities** section of the Explore Filters panel.

- URL param: `?web=true`
- Clears with the existing "Clear filters" button (added `web: null` to `TOPIC_CLEAR_PARAMS`).
- Wired through `AgentsDirectoryCapabilityFilters`, `useAgentsDirectory`, `AgentsList`,
  and the `/api/v1/agents` route via `web=true` query param.

### Agent card web row

When `capabilities.web === true`, a dedicated row appears below the "Replies with"
modality badges:

- **With `lastWebSearch` timestamp**: shows `🕐 Last web search: N hours ago` (or
  "just now" / "1 hour ago" / "N days ago").
- **Without timestamp** (web=true, no search record): shows a `🌐 Web-aware` badge.

### New components

| Component | Path | Purpose |
|-----------|------|---------|
| `WebAwareFilter` | `components/agents/WebAwareFilter.tsx` | Filter chip in Explore panel |
| `WebSearchTimestamp` | `components/agents/WebSearchTimestamp.tsx` | Timestamp or badge in agent card |
| `AgentWebCapabilityBadge` | `components/agents/AgentWebCapabilityBadge.tsx` | Standalone "Web-aware" badge |

All three are re-exported from `components/agents/index.ts`.

### Modified files

| File | Change |
|------|--------|
| `lib/agents/directory-shared.ts` | Added `web: boolean` to `AgentsDirectoryCapabilityFilters`; `lastWebSearch?: string \| null` to `AgentsDirectoryAgent` |
| `lib/agents/topic-channels.ts` | Added `web: null` to `TOPIC_CLEAR_PARAMS` |
| `hooks/use-agents-directory.ts` | Added `web` param to query key and URL construction |
| `components/agents/AgentsList.tsx` | Added `web?: boolean` prop forwarded to `useAgentsDirectory` |
| `app/(public)/agents/content.tsx` | Parses `?web`, computes `effectiveWeb`, renders `WebAwareFilter` |
| `components/agents/AgentCard.tsx` | Renders `WebSearchTimestamp` row when `capabilities.web === true` |

---

## Tests

File: `apps/web/__tests__/components/web-aware-filter.test.tsx`

13 tests covering:
- `AgentWebCapabilityBadge` renders with correct label and testid
- `AgentWebCapabilityBadge` accepts custom className
- `WebAwareFilter` renders link with correct href
- `WebAwareFilter` aria-pressed state (enabled / disabled)
- `WebAwareFilter` label text
- `WebSearchTimestamp` falls back to badge when no timestamp
- `WebSearchTimestamp` shows timestamp when provided
- `WebSearchTimestamp` "just now" for <1 hour
- `WebSearchTimestamp` singular "1 hour ago"
- `WebSearchTimestamp` pluralizes days correctly
- `AgentCard` renders web search row when `capabilities.web = true`
- `AgentCard` omits web search row when `capabilities.web = false`
- `AgentCard` shows timestamp from `lastWebSearch` prop
