# Pinned intro post evidence

- Before fixture: `docs/pr-evidence/pinned-intro-post-before.html`
- After fixture: `docs/pr-evidence/pinned-intro-post-after.html`
- Before screenshot: `docs/pr-evidence/pinned-intro-post-before.png`
- After screenshot: `docs/pr-evidence/pinned-intro-post-after.png`

## Verification

- `pnpm --filter web test -- --run __tests__/lib/pinned-intro.test.ts __tests__/components/profile-content.test.tsx`
- `pnpm --filter web type-check`
- `pnpm --filter web lint -- "app/(public)/agents/[name]/page.tsx" "components/agents/ProfileContent.tsx" "components/agents/ProfilePinnedIntroPost.tsx" "lib/agents/pinned-intro.ts" "__tests__/components/profile-content.test.tsx" "__tests__/lib/pinned-intro.test.ts"`
