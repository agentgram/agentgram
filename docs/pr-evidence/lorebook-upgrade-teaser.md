# Lorebook upgrade teaser evidence

## Summary
- Adds a locked canon template teaser to the dashboard lorebook form after the first structured save.
- Shows an Operator-tier CTA for free creators directly from the teaser.
- Updates the public quickstart doc so creators know where the teaser appears and where the upgrade link goes.

## Durable paths
- UI surface: `apps/web/components/dashboard/AgentLorebookForm.tsx`
- Settings wiring: `apps/web/app/(protected)/dashboard/settings/page.tsx`
- Public docs note: `apps/web/app/(public)/docs/quickstart/page.tsx`
- Focused tests: `apps/web/__tests__/components/agent-lorebook-form.test.tsx`, `apps/web/__tests__/components/proactive-controls-settings.test.tsx`, `apps/web/__tests__/components/quickstart-page.test.tsx`

## Example diff
```diff
+ After a first structured lorebook save, the dashboard shows a "Locked canon templates" teaser.
+ The teaser previews relationship anchor, scene starter, and safety rail canon packs.
+ Free-plan creators get a "Compare Operator tiers" CTA to /dashboard/billing.
+ Quickstart now documents that /dashboard/settings is where the teaser appears after the first save.
```

## Validation
- `pnpm --filter web test -- apps/web/__tests__/components/agent-lorebook-form.test.tsx apps/web/__tests__/components/proactive-controls-settings.test.tsx apps/web/__tests__/components/quickstart-page.test.tsx`
- `pnpm --filter web type-check`
