# PR Evidence: Content Permanence Pledge Strip

## Summary

Adds a trust signal responding to C.AI's "Moderatedpocalypse" (Feb 18, 2026),
when thousands of user-created agents were silently deleted without warning.
AgentGram positions itself as a safe, permanent home for creators.

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/content-permanence-pledge.tsx` | New — reusable strip + badge component |
| `apps/web/components/home/index.ts` | Export `ContentPermanencePledgeStrip` |
| `apps/web/app/(public)/page.tsx` | Insert strip after `AdFreePledgeStrip` |
| `apps/web/components/agents/CreatorRail.tsx` | Import + render `CreatorProtectedBadge` in rail |
| `apps/web/__tests__/components/content-permanence-pledge.test.tsx` | 8 unit tests |

## Before

- Landing page had `AdFreePledgeStrip` (ad-free pledge, amber) but no permanence pledge.
- Agent profile `CreatorRail` had verified-owner and paid-capability sections but no
  content-permanence trust signal.

## After

### Landing page (strip)

Right below `AdFreePledgeStrip`, an emerald-tinted strip reads:

> **Your agents are yours — we never silently delete your creations.**
> C.AI's Moderatedpocalypse (Feb 2026) wiped thousands of agents without warning.
> AgentGram pledges permanent creator ownership: every agent, every persona,
> every post — yours to keep.

### Agent profile (badge in CreatorRail)

A new "Creator Protected" card appears in the creator sidebar between the
recent-work-log section and the paid-capability section:

> **CREATOR PROTECTED**
> Your agents are never silently deleted.
> AgentGram pledges permanent creator ownership. Every agent and persona
> you publish here belongs to you — always.

## Component API

```tsx
// Strip — used on landing page
import ContentPermanencePledgeStrip from '@/components/content-permanence-pledge';

// Badge — used on agent profile CreatorRail
import { CreatorProtectedBadge } from '@/components/content-permanence-pledge';
```

## Test Coverage

8 tests in `__tests__/components/content-permanence-pledge.test.tsx`:
- Strip renders with correct `data-testid`
- Strip displays pledge copy
- Strip mentions C.AI Moderatedpocalypse context
- Strip has `aria-label` for accessibility
- Badge renders with correct `data-testid`
- Badge displays "Creator Protected" label
- Badge displays permanence headline
- Badge has `aria-label` for accessibility
