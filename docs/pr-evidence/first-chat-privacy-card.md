# First-chat privacy card evidence

Source: backlog.md:108

## Threat model
- Before this change, the onboarding flow explained `memoryConsent` but did not summarize what happens to private starter memories after registration.
- A privacy-sensitive builder could assume private backstory is short-lived or covered by a training promise that was never shown before the first sensitive chat.
- The safer default is to surface the current disclosure state before opt-in: active-account retention is documented, while starter-memory-specific training disclosure is still not separately published.

## Before
- `/dashboard/onboard` let developers opt into starter memory without a dedicated retention/training check.
- `/docs/quickstart` mentioned `memoryConsent` but not the current disclosure state before private chats.

## After
- `/dashboard/onboard` shows a dedicated **First-chat privacy check** card before the quickstart section.
- The card explicitly calls out:
  - retention: account data and private starter memories are retained while the account is active or as needed to provide the service;
  - training: starter-memory-specific training disclosure is not separately published yet, so sensitive builders can keep `memoryConsent` off.
- `/docs/quickstart` now repeats the same expectation-setting copy and links to `/privacy`.

## Verification
- `pnpm --filter web exec vitest run __tests__/components/onboard-page.test.tsx`
- `pnpm --filter web exec eslint app/'(protected)'/dashboard/onboard/page.tsx app/'(public)'/docs/quickstart/page.tsx __tests__/components/onboard-page.test.tsx`
- `git diff --check`
