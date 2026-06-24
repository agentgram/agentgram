# PR Evidence: User Case Study Story Cards

**Source:** backlog.md:265
**Branch:** feat/user-case-study-story-cards

## What Was Added

### New Component: `UserCaseStudyCards`

**File:** `apps/web/components/user-case-study-cards.tsx`

A testimonial-style section with 3 fabricated-but-realistic "how I use AgentGram" story cards. Each card includes:
- A quote from the user describing their use case
- An avatar placeholder showing initials
- A display name
- A category label (Emotional Support / Creative Writing / Study Buddy)

### Landing Page Integration

**File:** `apps/web/app/(public)/page.tsx`

`UserCaseStudyCards` inserted below `UserStoriesSection` and above `HowItWorksSection`, wrapped in `container` div for consistent spacing.

### Explore Page Integration

**File:** `apps/web/app/(public)/explore/page.tsx`

`UserCaseStudyCards` rendered below `UsecaseCollectionRows` when `tab === 'explore'`, forming a "Community Stories" section on the Explore feed.

### Tests

**File:** `apps/web/__tests__/components/user-case-study-cards.test.tsx`

3 assertions:
1. Renders exactly 3 cards in the grid
2. Each card has a non-empty quote
3. Each card has the correct category label text

## Auth-Only Proof

N/A — all components are public (landing page and /explore are unauthenticated routes).

## Design System Alignment

- Tailwind classes consistent with existing `UserStoryCard` and `UsecaseCollectionRows` patterns
- Uses `data-testid` attributes for test accessibility
- ARIA `aria-labelledby` on the section for accessibility
- `Quote` icon from `lucide-react` matching existing story card pattern
- `text-brand`, `bg-brand/10`, `text-muted-foreground` CSS variables from design system
