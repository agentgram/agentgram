# C.AI Stories-Mode Escape CTA — PR Evidence

## Summary

Adds a `NoChatIsolationBadge` section to the landing page (`/`) and pricing page (`/pricing`), counter-positioning against Character.AI's mandatory Stories mode that restricts free chat for minors. Targets parents and teens fleeing the isolation rollout with direct messaging: "Chat freely — no forced Stories mode restrictions."

Source: backlog.md row 202

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/home/NoChatIsolationBadge.tsx` | New `NoChatIsolationBadge` component |
| `apps/web/components/home/index.ts` | Export `NoChatIsolationBadge` from home barrel |
| `apps/web/app/(public)/page.tsx` | Import + render `NoChatIsolationBadge` after `CompetitorMigrationSection` |
| `apps/web/app/(public)/pricing/page.tsx` | Import + render `NoChatIsolationBadge` between plan grid and memory pledge |
| `apps/web/__tests__/components/no-chat-isolation-badge.test.tsx` | Unit tests for the new component |

## Before

- Landing page: competitor migration section mentioned Replika/Kindroid but made no mention of Character.AI Stories mode restrictions.
- Pricing page: hero banner had a general "Tired of Character.AI's reply limits?" nudge but no specific Stories mode counter-messaging.
- No dedicated component targeting users fleeing C.AI's mandatory Stories mode isolation.

## After

### Landing Page (after `CompetitorMigrationSection`)

A full-width section in green accent tones renders between the competitor migration checklist and the platform comparison table:

```
┌─────────────────────────────────────────────────────┐
│  [icon]  [ No forced Stories mode ]                 │
│                                                     │
│  Chat freely — no forced Stories mode restrictions  │
│                                                     │
│  Unlike Character.AI, we don't restrict your chat   │
│  experience or isolate you into limited modes.      │
│  Free chat stays free — for everyone, including     │
│  minors.                                            │
│                                                     │
│  [ Start chatting free → ]   [ See all plans ]      │
└─────────────────────────────────────────────────────┘
```

### Pricing Page (between plan grid and `MemoryStabilityPledge`)

The same `NoChatIsolationBadge` renders on the pricing page, giving users evaluating plans a clear contrast point between AgentGram and Character.AI's restricted modes before they see the feature comparison table.

## Positioning Rationale

Character.AI's Stories mode rollout (2025-2026) mandates that minors can only interact in a supervised "Stories" format, preventing direct free-form chat. This created a wave of users — especially parents and teens — actively searching for alternatives. The copy "no forced Stories mode restrictions" directly addresses the pain point without being disparaging.

## Test Coverage

See `apps/web/__tests__/components/no-chat-isolation-badge.test.tsx`:
- Renders the CTA section container with correct `data-testid`
- Displays the main heading: "Chat freely — no forced Stories mode restrictions"
- Sub-copy mentions "Unlike Character.AI"
- Badge label reads "No forced Stories mode"
- Primary CTA links to `/auth/login`
- Secondary CTA links to `/pricing`
- `aria-labelledby` wired to heading `id` for accessibility
