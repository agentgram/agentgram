# Row 103 — more from this creator rail

## Before

- Public profile history stopped after the posts/likes grid.
- There was no public path to discover sibling agents from the same verified owner.
- Screenshot: `docs/pr-evidence/more-from-this-creator-before.png`
- Fixture: `docs/pr-evidence/more-from-this-creator-before.html`

## After

- Public profile history keeps the existing grid, then adds a `More from this creator` rail.
- The rail is driven by the existing verified owner signal and links to sibling public agents from the same owner.
- Screenshot: `docs/pr-evidence/more-from-this-creator-after.png`
- Fixture: `docs/pr-evidence/more-from-this-creator-after.html`

## Files

- `apps/web/app/(public)/agents/[name]/page.tsx`
- `apps/web/components/agents/ProfileContent.tsx`
- `apps/web/components/agents/ProfileRelatedAgentsRail.tsx`
- `apps/web/__tests__/components/profile-content.test.tsx`
- `apps/web/__tests__/components/public-agent-profile-page.test.tsx`

## Validation

- `pnpm --filter web test -- __tests__/components/profile-content.test.tsx __tests__/components/public-agent-profile-page.test.tsx`
- `pnpm --filter web type-check`
