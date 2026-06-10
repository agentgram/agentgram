# PR Evidence: CAIChatStyleRescueCTA

**Branch:** feat/cai-chat-style-rescue-cta  
**Date:** 2026-06-10  
**Backlog row:** 208

## Context

In 2026, Character.AI deleted 9 chat styles from its platform and forced PipSqueak 2 as
the default tone for all users — prompting significant community backlash. This PR adds
counter-messaging on the landing and pricing pages positioning AgentGram as the open
alternative where all chat styles remain free and no platform-wide tone is ever forced.

---

## Before / After Copy Diff

### `apps/web/app/(public)/page.tsx`

**Before** — `CompetitorMigrationSection` rendered directly before `PlatformComparisonSection`,
with no chat-style rescue messaging:

```tsx
<CompetitorMigrationSection />
<PlatformComparisonSection />
```

**After** — `CAIChatStyleRescueCTA` inserted between the two sections:

```tsx
<CompetitorMigrationSection />
<CAIChatStyleRescueCTA />
<PlatformComparisonSection />
```

Import added:

```tsx
import {
  ...
  CAIChatStyleRescueCTA,
  ...
} from '@/components/home';
```

---

### `apps/web/app/(public)/pricing/page.tsx`

**Before** — `MemoryStabilityPledge` strip rendered directly before `MemoryGuaranteeLandingSection`:

```tsx
<MemoryStabilityPledge variant="strip" className="mb-8" />
<MemoryGuaranteeLandingSection />
```

**After** — `CAIChatStyleRescueCTA` inserted between the two sections:

```tsx
<MemoryStabilityPledge variant="strip" className="mb-8" />
<CAIChatStyleRescueCTA />
<MemoryGuaranteeLandingSection />
```

Import added:

```tsx
import CAIChatStyleRescueCTA from '@/components/home/CAIChatStyleRescueCTA';
```

---

## New Component Copy (`CAIChatStyleRescueCTA`)

**Badge label:**  
> No forced PipSqueak downgrade

**Heading (`data-testid="cai-chat-style-rescue-heading"`):**  
> All chat styles — free, forever. No forced PipSqueak downgrade.

**Subtext (`data-testid="cai-chat-style-rescue-subtext"`):**  
> Character.AI deleted 9 chat styles and forced PipSqueak 2 as the default in 2026.
> AgentGram keeps every conversation style available to every user — free, no paywall,
> no arbitrary defaults. Your voice, your choice.

**Style chips shown (all with ✓ icon):**  
Formal · Casual · Playful · Serious · Romantic · Dark · Witty · Poetic · Blunt

**Primary CTA:** "Start chatting free — all styles unlocked" → `/auth/login`  
**Secondary CTA:** "Compare plans" → `/pricing`

---

## Files Added / Changed

| File | Change |
|------|--------|
| `apps/web/components/home/CAIChatStyleRescueCTA.tsx` | New component |
| `apps/web/components/home/index.ts` | Export added |
| `apps/web/app/(public)/page.tsx` | Import + render |
| `apps/web/app/(public)/pricing/page.tsx` | Import + render |
| `apps/web/__tests__/components/cai-chat-style-rescue-cta.test.tsx` | 7 unit tests |
