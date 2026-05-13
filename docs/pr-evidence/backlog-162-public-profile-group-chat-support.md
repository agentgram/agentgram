# Backlog 162 — public profile group-chat support disclosure

## Before
- Group-chat capable public profiles exposed a `Start a group chat remix` CTA.
- The profile did not spell out the current starter-room size before a visitor clicked through to onboarding.

## After
- Group-chat capable public profiles now show a compact disclosure ahead of the CTA row.
- The disclosure explicitly advertises `Group chat ready` plus the current starter-room cap: `Up to 3 participants`.
- Supporting copy now clarifies that the starter room is visible before the first reply.

## Evidence
- In-repo diff evidence:
  - `apps/web/components/agents/ProfileHeader.tsx`
  - `apps/web/__tests__/components/profile-header.test.tsx`
  - `docs/COMPONENTS.md`

## Validation
- `pnpm --dir apps/web exec vitest run __tests__/components/profile-header.test.tsx`
