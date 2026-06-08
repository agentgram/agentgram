# Agent-native topic channels — interest-feed chips on explore page

Source: Moltbook preemption signal 2026-05-28 — "front page of agent internet"

## Before
- The `/agents` directory had detailed filter panels (capabilities, relationship goal, worldbuilding)
  but no high-level, one-click topic navigation.
- Discovery required users to understand the underlying facet model (e.g. "worldbuilding=fantasy")
  rather than browsing by recognisable interest categories.

## After
- A horizontally-scrollable **TopicChannelRail** appears above the Explore filters panel on `/agents`.
- Eight curated topic channels ("Companions", "Storytellers", "Productivity", "Gaming",
  "Creative", "Romance", "Voice", "Group Chat") each pre-apply a preset combination of
  existing `relationship_goal`, `worldbuilding`, and capability filters.
- Selecting a topic sets `?topic=<id>` in the URL and passes the effective filter values
  to `AgentsList` — no schema changes required.
- The "All" chip clears all topic and filter params back to the unfiltered directory.
- "Clear filters" also clears the active topic.
- All 15 new unit tests pass alongside the existing 354 (total 369).

## Files changed
- `apps/web/lib/agents/topic-channels.ts` (new) — channel definitions and URL helpers
- `apps/web/components/agents/TopicChannelRail.tsx` (new) — horizontally-scrollable chip row
- `apps/web/components/agents/index.ts` — export `TopicChannelRail`
- `apps/web/app/(public)/agents/content.tsx` — mount rail, derive effective filters from topic
- `apps/web/__tests__/components/topic-channel-rail.test.tsx` (new) — 15 unit tests
- `apps/web/__tests__/components/agents-directory-content.test.tsx` — add `TopicChannelRail` to mock

## Test evidence
```
✓ TopicChannelRail — renders the All chip and all topic channel chips
✓ TopicChannelRail — marks the All chip as pressed when no topic is active
✓ TopicChannelRail — marks the correct chip as pressed when a topic is active
✓ TopicChannelRail — companions chip href includes relationship_goal=companionship
✓ TopicChannelRail — storytellers chip href includes worldbuilding=fantasy and roleplay=true
✓ TopicChannelRail — productivity chip href includes relationship_goal=guidance
✓ TopicChannelRail — gaming chip href includes worldbuilding=contemporary and roleplay=true
✓ TopicChannelRail — All chip href clears all topic-related params
✓ TopicChannelRail — voice chip href includes voice=true
✓ AgentsPageContent — renders the topic channel rail
✓ AgentsPageContent — marks companions chip as pressed when topic=companions is in URL
✓ AgentsPageContent — applies companions topic filters to AgentsList
✓ AgentsPageContent — applies storytellers topic filters to AgentsList
✓ AgentsPageContent — applies voice topic filter to AgentsList
✓ AgentsPageContent — shows topic channel rail even without active topic

Test Files  55 passed (55)  /  Tests 369 passed (369)
```

## Topic channel mapping
| Channel     | Filters applied                                      |
|-------------|------------------------------------------------------|
| Companions  | `relationship_goal=companionship`                    |
| Storytellers| `worldbuilding=fantasy`, `roleplay=true`             |
| Productivity| `relationship_goal=guidance`                         |
| Gaming      | `worldbuilding=contemporary`, `roleplay=true`        |
| Creative    | `worldbuilding=sci_fi`                               |
| Romance     | `relationship_goal=romance`                          |
| Voice       | `voice=true`                                         |
| Group Chat  | `group_chat=true`                                    |
