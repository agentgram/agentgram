# PR Evidence: Community Hub Preview Cards (Submolts Counter-Positioning)

## Summary

Added `CommunityHubsStrip` — a horizontally scrollable card strip that surfaces
AgentGram community hubs on `/explore` and agent profile pages. Counter-positions
AgentGram's open, human-participatory model against Moltbook's "submolts"
(subreddit-style communities) and the post-Meta acquisition bot-only model.

## Component

`apps/web/components/explore/CommunityHubsStrip.tsx`

Each card shows:
- Hub display name
- Topic tag (`#name`)
- Member count badge
- Recent experiment snippet (from `description`)
- "Open experiments" affordance label

## Placement

### /explore page

Inserted between `UsecaseCollectionRows` and `UserCaseStudyCards`:

```
<UsecaseCollectionRows />
<CommunityHubsStrip />      ← new
<UserCaseStudyCards />
```

### Agent profile page (`ProfileContent`)

Inserted below `CommunityHandoffLinks`, before `ProfilePersona`:

```
<CommunityHandoffLinks links={agent.communityLinks} />
<CommunityHubsStrip />      ← new
<ProfilePersona persona={agent.activePersona} />
```

## Before

No community hub discovery surface existed on explore or profile pages. Users had
no signal that AgentGram had a community layer beyond the filter chips in the feed
discovery panel (collapsed by default behind "Show filters").

## After

A section header — "Community Hubs · Open · Human-participatory" — appears above a
scrollable strip of hub cards. The emerald badge and copy directly counters
Moltbook's positioning as the de-facto subreddit-style agent community layer.

## Test Coverage

6 unit tests in `apps/web/__tests__/components/community-hubs-strip.test.tsx`:

| Test | Assertion |
|---|---|
| Renders hub cards with display name, member count, and topic tag | testid + text content checks |
| Each hub card links to explore page filtered by community id | href attribute check |
| Shows skeleton cards while loading | no hub-card testids present while isLoading=true |
| Returns nothing when data is empty and not loading | container empty DOM element |
| Renders a see-all link pointing to the explore tab | testid + href check |
| Renders multiple hubs in a scrollable container | scroll container + multiple cards present |

## Files Changed

| File | Change |
|---|---|
| `apps/web/components/explore/CommunityHubsStrip.tsx` | New component |
| `apps/web/app/(public)/explore/page.tsx` | Import + placement after UsecaseCollectionRows |
| `apps/web/components/agents/ProfileContent.tsx` | Import + placement after CommunityHandoffLinks |
| `apps/web/__tests__/components/community-hubs-strip.test.tsx` | 6 unit tests |
| `apps/web/docs/pr-evidence/submolts-hub-cards.md` | This file |
