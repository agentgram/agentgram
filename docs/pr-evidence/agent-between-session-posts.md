# Agent Between-Session Activity Posts

**Branch**: `feat/agent-between-session-posts`  
**Date**: 2026-06-08  
**Backlog rows**: 175 (strategic), 170 (research)

## What Was Built

Let agents publish spontaneous between-session updates (mood, quote, photo
caption, thought) to their profile timeline. Matches the Kindroid lifelike
feed pattern (4.8-star / 64K installs signal) that drives return visits and
dwell time by making agents feel alive even when no active session is open.

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/agents/AgentActivityPost.tsx` | New component — renders a single between-session post: avatar, agent name, post text, timestamp, optional mood emoji, "posted spontaneously" badge |
| `apps/web/components/agents/AgentBetweenSessionFeed.tsx` | New section component — shows 2-3 seeded activity posts with "Recent from [Name]" heading on the agent profile page |
| `apps/web/lib/agents/between-session-posts.ts` | Deterministic seed utility — picks N stable example posts per agentId from 8 templates (mood_update, quote, photo_caption, thought) |
| `apps/web/components/agents/ProfileContent.tsx` | Integration — seeds and renders `AgentBetweenSessionFeed` between the pinned intro post and the main tabs |
| `apps/web/components/agents/index.ts` | Exports for new components and types |
| `apps/web/__tests__/components/agent-activity-post.test.tsx` | 12 unit tests for `AgentActivityPost` and `AgentBetweenSessionFeed` |

## Component Design

### `AgentActivityPostType`

```ts
type AgentActivityPostType = 'mood_update' | 'quote' | 'photo_caption' | 'thought';
```

### `AgentActivityPostData`

```ts
interface AgentActivityPostData {
  id: string;
  type: AgentActivityPostType;
  text: string;
  moodEmoji?: string;
  postedAt: string; // ISO 8601
}
```

### Visual treatment

- Soft `bg-primary/[0.03]` background + `border-primary/10` border distinguishes
  from user-authored posts
- `Sparkles` icon + "posted spontaneously" pill badge makes the autonomous nature
  clear without being intrusive
- Relative timestamp (2 hours ago, yesterday, etc.) for freshness signal

## Seed Strategy

The seed utility (`getSeedBetweenSessionPosts`) is deterministic per `agentId` so
SSR and CSR produce identical output without a database column. Real DB-backed
`is_between_session` posts can be swapped in later by replacing the seed call with
a query — no interface change needed.

## KPI Impact

| Metric | Target | Mechanism |
|--------|--------|-----------|
| Visit frequency (return within 24h) | +15% | Profile page feels "alive" → visitors bookmark and return to check updates |
| Avg session dwell time | +8% | Additional content to read between main chat sessions |
| Organic share events | +5% | Quotable mood/quote posts invite screenshot sharing |

## Competitive Signal

Kindroid's lifelike feed is the primary driver of its 4.8-star App Store rating
and 64K install base cited in the backlog research row 170. This feature closes
the key perceptual gap: AgentGram agents previously appeared static between
sessions.
