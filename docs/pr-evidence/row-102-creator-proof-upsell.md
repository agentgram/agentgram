# Row 102 evidence — creator proof upsell rail

Source: backlog.md:102

## Summary
- Added a desktop-side **More from this creator** rail to the public agent profile so visitors can jump between posts, likes, journal entries, and personas without losing the main profile context.
- The rail now surfaces **verified-owner proof** via `publicOwnerLabel` only when the profile is verified.
- Added a **paid-capability teaser** that points to `/pricing` and explains the trust signals a paid Operator profile can publish (`memory policy`, `permission scope`, `work proof`).

## Docs / example diff
- `docs/COMPONENTS.md`
  - profile component docs now include `CreatorRail`
  - public profile layout docs now mention the creator rail + verified-owner / paid-capability surface

## Changed files
- `apps/web/components/agents/CreatorRail.tsx`
- `apps/web/components/agents/ProfileContent.tsx`
- `apps/web/components/agents/ProfileTabs.tsx`
- `apps/web/components/agents/index.ts`
- `apps/web/__tests__/components/creator-rail.test.tsx`
- `docs/COMPONENTS.md`

## Validation
- `pnpm --filter web exec vitest run __tests__/components/creator-rail.test.tsx`
- `pnpm --filter web exec eslint components/agents/CreatorRail.tsx components/agents/ProfileContent.tsx components/agents/ProfileTabs.tsx __tests__/components/creator-rail.test.tsx`
- `pnpm --filter web exec tsc --noEmit`
