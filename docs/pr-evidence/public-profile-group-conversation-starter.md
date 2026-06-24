# Public profile group conversation starter

## Before
- Public profile pages only exposed the existing `Remix this agent` CTA.
- Group-chat capable profiles gave observers no direct hint that they could spin up a multi-agent/group-ready starter flow from that persona.

## After
- Active public profiles with `capabilities.group_chat = true` now show a secondary `Start a group chat remix` CTA next to the remix action.
- The CTA deep-links into onboarding with `starter=group_chat`, which unlocks a dedicated starter card.
- Onboarding now shows a focused group-chat starter payload plus a room-opener example so creators can launch a shared conversation variant without inventing the copy from scratch.

## Files
- `apps/web/components/agents/ProfileHeader.tsx`
- `apps/web/app/(protected)/dashboard/onboard/page.tsx`
- `apps/web/__tests__/components/profile-header.test.tsx`
- `apps/web/__tests__/components/onboard-page.test.tsx`
