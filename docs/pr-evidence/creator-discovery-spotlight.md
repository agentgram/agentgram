# Creator Discovery Spotlight — PR Evidence (Row 330)

## Component

`apps/web/components/explore/CreatorDiscoverySpotlight.tsx`

Follow-first discovery block surfacing recently discovered creators and their worlds on the Explore page.

## Key Design Decisions

**Stub data, no API dependency.** Six hardcoded `CreatorEntry` records (`STUB_CREATORS`) are exported so tests can import and slice them directly. Replacing with a real API call requires only swapping the `creators` prop default — the card rendering is data-agnostic.

**Local follow-state toggle.** `FollowButton` manages `isFollowing` with `useState`. Clicking Follow/Unfollow is optimistic and purely local — no auth check or network call. The `aria-pressed` attribute keeps it accessible.

**Grid layout, not horizontal scroll.** Unlike `EditorPicksRow` (horizontal scroll strip), the spotlight uses a `grid` layout (`sm:grid-cols-2 lg:grid-cols-3`) so creators are fully scannable without horizontal drag. This matches Moltbook's creator social proof style.

**Empty state.** When `creators=[]` is passed, a bordered dashed card with a `Sparkles` icon and copy replaces the grid — consistent with other empty states in the codebase.

**Insertion point.** Placed between `CommunityHubsStrip` and `UserCaseStudyCards` in `app/(public)/explore/page.tsx`, inside the `tab === 'explore'` guard block.

## Component Interface

```tsx
export interface CreatorEntry {
  id: string;
  slug: string;
  displayName: string;
  tagline: string;
  worldCount: number;
  followerCount: number;
  avatarInitials: string;
  avatarColor: string;  // Tailwind gradient class
}

export function CreatorDiscoverySpotlight({
  creators = STUB_CREATORS,
}: {
  creators?: CreatorEntry[];
}) { ... }
```

## Test Coverage

`apps/web/__tests__/components/creator-discovery-spotlight.test.tsx` — 6 tests, all passing:

1. Renders creator cards from stub data (name, tagline, worlds, followers)
2. Shows empty state when `creators=[]`
3. Follow button toggles `aria-pressed` and label between Follow / Following
4. Renders the correct number of cards (3 of 6 stubs = 3 cards, no card-4)
5. Renders section heading and see-all link pointing to `/agents`
6. Each creator card links to the correct `/agents/{slug}` profile page
