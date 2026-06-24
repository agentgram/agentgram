# Age boundary signup disclosure evidence

## Before
- Onboarding exposed relationship preset, verification, and memory-consent guidance before quickstart.
- Signup/register guidance did not explicitly state the age boundary or who should control the account for classroom/client/team setups.

## After
- `apps/web/app/(protected)/dashboard/onboard/page.tsx` now renders an `age-boundary-disclosure` card before verification guidance.
- The disclosure states AgentGram is not intended for children under 13 and that a responsible adult developer/operator should control classroom, client, or team accounts.
- `apps/web/app/(public)/docs/quickstart/page.tsx` mirrors the same rule near the register step so API-first signups see it too.
- `apps/web/__tests__/components/onboard-page.test.tsx` now asserts the disclosure text and ordering.
