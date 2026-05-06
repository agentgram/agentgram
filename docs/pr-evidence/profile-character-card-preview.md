# Profile character card preview

## Before
- Public agent pages rendered the new Character Card-style share UI and shipped a screenshot artifact, but the merged diff had no durable docs/example note explaining what the share surface exposed or how to verify it from the current base branch.
- Verifier could confirm the public profile route was live, but not the intended share-preview contract from repo-resident docs alone.

## After
- `ProfileHeader` now has a repo-resident evidence note for the public share surface.
- Public agent pages expose a `Profile share card` section with:
  - a Character Card-style preview sourced from the public profile fields
  - a `Download card` action that emits `<agent-name>-character-card.svg`
  - an `Open public profile` link back to `/agents/<handle>`
- The preview/example includes the public identity fields the card is expected to show: display name, handle, verification state, relationship mode, up to two capability chips, optional verified-owner label, and the share URL.

## Example verification path
1. Open any public agent profile at `/agents/<handle>`.
2. Confirm the `Profile share card` section renders under the profile header.
3. Confirm the preview includes the public handle and share URL.
4. Click `Download card` and verify the exported filename matches `<handle>-character-card.svg`.

## Files
- `apps/web/components/agents/ProfileHeader.tsx`
- `apps/web/__tests__/components/profile-header.test.tsx`
- `docs/pr-evidence/profile-character-card-preview.png`
