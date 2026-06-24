# PR Evidence: C.AI Imagine Gallery Free Counter

## Backlog Row
Row 215 — C.AI Imagine Gallery free counter

## Signal
Character.AI locked Imagine Gallery (AI image generation) behind c.ai+ subscription in March 2026. This creates a competitive opening: AgentGram makes AI image generation available to all users on all plans at no extra cost.

## Changes

### New Components

**`apps/web/components/home/ImagineGalleryFreeCounterBadge.tsx`**
- Full section CTA matching the pattern of `CAILorebookEscapeCTA` and `CAIChatStyleRescueCTA`
- Emerald color scheme to differentiate from violet (Lorebook) and sky (Chat Styles)
- Badge: "No c.ai+ paywall"
- Heading: "AI image generation — free for all users, no c.ai+ required"
- Copy explicitly names C.AI's Imagine Gallery paywall (March 2026)
- CTAs: "Start generating images free" → /auth/login, "Compare plans" → /pricing
- `data-testid="imagine-gallery-free-counter-badge"`, `aria-labelledby` wired

**`apps/web/components/agents/ImagineGalleryFreeBadge.tsx`**
- Small inline badge for agent profile pages, mirrors `VoiceRetentionUpliftBadge` pattern
- Shown on profiles where `agent.capabilities.image === true`
- `data-testid="imagine-gallery-free-badge"`

### Edited Files

**`apps/web/components/agents/ProfileHeader.tsx`**
- Imports `ImagineGalleryFreeBadge`
- Renders `<ImagineGalleryFreeBadge className="mt-2" />` after `CapabilitySampleTray` when `agent.capabilities?.image === true`

**`apps/web/app/(public)/pricing/page.tsx`**
- Imports `ImagineGalleryFreeCounterBadge` and `ImageIcon`
- Adds "AI Image Gen — free for all" trust badge in hero section (emerald, `data-testid="pricing-image-gen-badge"`)
- Adds highlighted comparison row in feature table: "AI Image Generation" with "vs. c.ai+ exclusive" label, all three plan columns show "✓ Free" (`data-testid="pricing-image-gen-row"`)
- Adds `<ImagineGalleryFreeCounterBadge />` section after `CAIChatStyleRescueCTA`

### Tests

**`apps/web/__tests__/components/imagine-gallery-free-counter-badge.test.tsx`**
7 tests covering:
- Renders with correct testid
- Heading mentions "image generation" and "free"
- Subtext mentions "Character.AI" and "c.ai+"
- Badge label shows "No c.ai+ paywall"
- Primary CTA links to /auth/login
- Secondary CTA links to /pricing
- aria-labelledby wired to heading id

## Before / After

**Before:** No counter-messaging against C.AI's image generation paywall.

**After:** "AI image gen free" badge on image-capable agent profiles + emerald trust badge on pricing hero + highlighted comparison row in pricing table + full `ImagineGalleryFreeCounterBadge` section on pricing page.
