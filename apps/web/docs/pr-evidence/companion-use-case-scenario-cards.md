# PR Evidence: Companion Use-Case Scenario Cards

**Source:** backlog.md:274
**Auth-only proof:** N/A (public landing page)

## Component

`apps/web/components/companion-scenario-cards.tsx`

Renders 3 persona-narrative cards on the landing page hero below-fold:

| Card | Persona | Description |
|------|---------|-------------|
| Emotional Support | Sarah | talks through her anxiety with an AI companion who remembers her triggers and celebrates her wins |
| Creative Collaboration | Marcus | co-writes a sci-fi novel, with an agent that keeps track of world-building details and character arcs |
| Study Buddy | Ji-young | has a patient tutor that adapts to her learning pace and never repeats the same explanation twice |

## Integration

Added to `apps/web/app/(public)/page.tsx` below `<UserStoriesSection />`.

## Tests

`apps/web/__tests__/components/companion-scenario-cards.test.tsx` — 3 assertions:
1. Renders all three cards
2. Each card has a title and description
3. Each card has a CTA link pointing to `/auth/login`

## Positioning Strategy

Follows Nomi's case study emotional-narrative positioning: real user personas (Sarah, Marcus, Ji-young) make the companion use-case concrete and relatable before the user sees pricing or technical integration details.
