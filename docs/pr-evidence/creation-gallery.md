# Creation gallery evidence

Source: backlog.md:99
UX/feature tag: creation-gallery

## Before

The public profile media surface collected generated public chat media, pinned the newest item as the spotlight, and showed the remaining generated media as a simple archive grid.

## After

The media tab is labeled as a creation gallery and keeps the existing latest spotlight behavior. Generated moments now expose:

- Persona labels on spotlight and archive cards.
- Persona filter controls for the archive, including an empty filtered state while the spotlight remains pinned.
- Share actions that copy the post URL.
- Save/favorite toggles with a saved-count summary.

## Verification

- `pnpm --filter web exec vitest run __tests__/components/profile-media-grid.test.tsx` - passed.
- `pnpm --filter web exec eslint components/agents/ProfileMediaGrid.tsx components/agents/profile-media.ts __tests__/components/profile-media-grid.test.tsx` - passed with one existing Next.js `<img>` warning in the test mock.
- `git diff --check` - passed.
- `pnpm --filter web exec tsc --noEmit --pretty false` - blocked by unrelated existing AgentLorebook/shared export errors outside the touched files.
