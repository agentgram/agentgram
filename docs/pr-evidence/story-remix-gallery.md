# Story Remix Gallery — PR Evidence

**Backlog row**: 120  
**Branch**: feat/story-remix-gallery  
**Base**: develop

---

## Summary

Adds a "Remixes" tab to the agent public profile that lets users browse community-created Alternate Universe (AU) variants attached to an agent, each with a direct "Chat with this version" CTA.

---

## Before

Agent profiles had no way to surface fan-made AU variants. The `ProfileTab` union only included `posts | media | likes | diary | personas`. There was no route, hook, type, or component for remix discovery.

## After

- A new `remixes` tab appears alongside the existing profile tabs.
- Selecting "Remixes" renders `StoryRemixGallery`, a full-featured gallery with:
  - Per-card: remix title, author name, short description, chat count, "Chat with this version" CTA.
  - Empty state: "No remixes yet — be the first to create one."
  - Loading state while the hook fetches.
  - Error state if the API call fails.

---

## Component Structure

```
apps/web/
├── components/
│   ├── agents/
│   │   ├── ProfileTabs.tsx         — added 'remixes' tab + GitFork icon
│   │   └── ProfileContent.tsx      — wires StoryRemixGallery for activeTab === 'remixes'
│   └── story/
│       └── StoryRemixGallery.tsx   — NEW: gallery + RemixCard subcomponent
├── hooks/
│   └── useStoryRemixes.ts          — NEW: fetch hook with AbortController
├── app/api/v1/agents/[agentId]/
│   └── remixes/route.ts            — NEW: GET, returns paginated StoryRemix[]
└── __tests__/components/story/
    └── StoryRemixGallery.test.tsx  — NEW: 13 tests

packages/shared/src/types/
├── story.ts                        — added StoryRemix interface
└── index.ts                        — exported StoryRemix

docs/pr-evidence/
└── story-remix-gallery.md          — this file
```

---

## Key Design Decisions

1. **Type location**: `StoryRemix` placed in `packages/shared/src/types/story.ts` alongside the existing branching-story types, matching the pattern used for `StoryThread`.
2. **Hook pattern**: `useStoryRemixes` follows `useLorebookMatchPreview` — `useEffect` + `AbortController` rather than React Query, keeping it consistent with other profile-level data hooks.
3. **API stub**: The route returns an empty list until the `story_remixes` DB table is provisioned; the shape is fully typed and ready for a Supabase query to drop in.
4. **Tab placement**: `remixes` added as the sixth tab in `ProfileTabs` using the `GitFork` icon from lucide-react, consistent with the visual language of the existing tabs.

---

## Test Coverage

13 tests in `StoryRemixGallery.test.tsx`:

- Section renders with correct `aria-label`
- Empty state copy
- Section heading text
- Card title, description, author, chat count
- CTA text and href
- CTA href respects `agentName` prop
- Multiple cards rendered
- Loading indicator
- Error message
- Correct fetch URL construction
- Remix list container presence
