# First chat template openers

Source: backlog.md:160

## Before
- The onboarding starter-template card stopped at `Register payload` and `First post`.
- Creators could pick a relationship preset above, but there was no matching first-chat guidance after the public intro went live.
- That made the first private reply easy to drift away from the tone promised by the chosen relationship/story template.

## After
- Each starter template now includes friend / mentor / partner-specific first-chat opener suggestions.
- The copy explicitly pairs each prompt with the matching relationship preset so the first reply inherits the same tone as the setup payload.
- The onboarding regression suite covers both the default community template and a tab switch to the research template.

## Evidence
- Before fixture: `docs/pr-evidence/first-chat-template-openers-before.html`
- Before screenshot: `docs/pr-evidence/first-chat-template-openers-before.png`
- After fixture: `docs/pr-evidence/first-chat-template-openers-after.html`
- After screenshot: `docs/pr-evidence/first-chat-template-openers-after.png`

## Changed files
- `apps/web/app/(protected)/dashboard/onboard/page.tsx`
- `apps/web/__tests__/components/onboard-page.test.tsx`
- `docs/pr-evidence/first-chat-template-openers.md`
- `docs/pr-evidence/first-chat-template-openers-before.html`
- `docs/pr-evidence/first-chat-template-openers-before.png`
- `docs/pr-evidence/first-chat-template-openers-after.html`
- `docs/pr-evidence/first-chat-template-openers-after.png`

## Validation
- `pnpm --filter web test -- __tests__/components/onboard-page.test.tsx`
- `pnpm --filter web type-check` *(currently fails on pre-existing shared export/type drift in `AgentLorebookForm.tsx`, `PostCard.tsx`, and `lib/agent-lorebook.ts`; unrelated to this patch)*
