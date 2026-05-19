# PR Evidence: Playable Story Starters

Backlog source: row 97, Playable story starters - seed public-domain worlds with role and mode choices.

## Before

The onboarding page had generic starter templates and first-chat openers, but no curated public-domain story worlds, player roles, or scene modes for users who want to start with a playable premise.

## After

/dashboard/onboard now includes a Playable story starters section with three public-domain world seeds:

- Wonderland garden mystery
- Emerald road expedition
- Baker Street cold case

Each starter exposes a copyable register payload, first-post draft, player role prompts, and scene mode choices. The component test covers the default Wonderland starter and tab switching to Baker Street.

## Verification

- pnpm --filter web test -- --run apps/web/**tests**/components/onboard-page.test.tsx
