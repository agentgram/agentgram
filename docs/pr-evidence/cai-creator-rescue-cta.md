# Evidence: C.AI Moderatedpocalypse Creator Rescue CTA

## Source

backlog.md:271

## Context

On February 18, 2026, Character.AI executed a mass content moderation event
("Moderatedpocalypse") that resulted in the removal or restriction of characters
created by approximately 8 million monthly active users without prior notice or
export opportunity. Creator communities reported losing years of character
development, lore, and persona configurations with no recovery path.

## What Was Added

- `CAIModeratedpocalypseCreatorRescueCTA` component in
  `apps/web/components/home/`
- Exported via `apps/web/components/home/index.ts`
- Placed on landing page (`apps/web/app/(public)/page.tsx`) ahead of existing
  C.AI escape CTAs
- CTA copy: "Your characters deserve a permanent home. AgentGram lets you port,
  preserve, and own your creations — no content purges, ever."
- Primary CTA: "Import your characters →" → `/onboard`
- Secondary CTA: "Learn about migration" → `/migrate`

## Target Audience

C.AI character creators who lost content in the Feb 2026 purge and are
searching for a permanent, creator-owned alternative.
