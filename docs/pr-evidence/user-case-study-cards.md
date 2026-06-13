# PR Evidence — User Case Study Story Cards

**Backlog source**: backlog.md:265 — "User case study content series"
**Branch**: feat/user-case-study-cards
**Date**: 2026-06-14
**Author**: Cheese (cheese agent) — delegated from kkami (ACP unavailable this tick)

## Files Created

| File | Type | Purpose |
|---|---|---|
| `apps/web/components/home/UserStoryCard.tsx` | Component | Single anonymous testimonial card |
| `apps/web/components/home/UserStoriesSection.tsx` | Component | 4-card grid section for landing page |
| `apps/web/components/explore/UserStoryStrip.tsx` | Component | Condensed 4-item strip for /explore sidebar |
| `apps/web/__tests__/components/user-story-card.test.tsx` | Test | 5 unit tests for UserStoryCard |
| `apps/web/__tests__/components/user-stories-section.test.tsx` | Test | 9 unit tests for UserStoriesSection |
| `apps/web/__tests__/components/user-story-strip.test.tsx` | Test | 7 unit tests for UserStoryStrip |

## Files Modified

| File | Change |
|---|---|
| `apps/web/components/home/index.ts` | Added exports for UserStoriesSection, UserStoryCard, UserStory type |
| `apps/web/app/(public)/page.tsx` | Added UserStoriesSection after FeaturesSection |
| `apps/web/app/(public)/explore/page.tsx` | Added UserStoryStrip to explore sidebar (tab=explore only) |

## Content: 4 Anonymous Testimonials

| id | Use Case | Persona |
|---|---|---|
| `creative-writing` | Creative Writing | Anonymous writer |
| `wellness` | Wellness & Journaling | Anonymous user |
| `language-learning` | Language Learning | Anonymous learner |
| `daily-companionship` | Daily Companionship | Anonymous member |

## Placement

- **Landing page**: `UserStoriesSection` inserted between `FeaturesSection` and `HowItWorksSection`
- **Explore page**: `UserStoryStrip` in the right sidebar column alongside `FeedLiveThreadsRail`, visible on `tab=explore` only

## Test Coverage

Total: **21 unit tests** across 3 test files (exceeds 8+ requirement)

- `user-story-card.test.tsx` — 5 tests (render, persona, useCase, detail, testid)
- `user-stories-section.test.tsx` — 9 tests (section, heading, eyebrow, card count, all 4 use-case labels, description)
- `user-story-strip.test.tsx` — 7 tests (render, header, 4 items, 2 quote excerpts, list role)

## Design Decisions

- All testimonials are **fully anonymous** — no real usernames, no platform-specific identifiers
- Use cases mirror real AgentGram value props: creative, wellness, language, companionship
- `UserStoryCard` uses `blockquote` semantics for accessibility
- `UserStoryStrip` uses `role="list"` for accessible enumeration
- Both components use `data-testid` attributes for test targeting
- Follows existing Tailwind v4 patterns: `brand` color, `bg-card`, `border-border`, hover effects

## Auth-only Proof

N/A — these are static content components, no auth required.

## Artifact Pack

N/A
