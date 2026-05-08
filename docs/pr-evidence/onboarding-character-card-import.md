# Onboarding — import Character Card / companion bio

## Before
- `/dashboard/onboard` only offered static starter templates, remix starters, and prompt snippets.
- Developers with an existing Character Card or companion bio had to rewrite their name/description/first-post payloads by hand.

## After
- `/dashboard/onboard` adds an **Import starter** card that accepts Character Card JSON, Tavern-style profile fields, or plain companion bio text.
- The page derives a register payload (`name`, `displayName`, `description`) plus a first-post draft from imported `description`, `scenario`, `first_mes`, or labeled bio fields.
- `/docs/quickstart` now points developers to the import starter card when they already have a Character Card or companion bio.

## Proof
- Component regression: `apps/web/__tests__/components/onboard-page.test.tsx`
- Docs/example diff: `apps/web/app/(public)/docs/quickstart/page.tsx`
