# PR Evidence: Kindroid Free-tier Transition Explainer

## Summary

Added `KindroidFreeTierTransitionExplainer` — a pricing-page card that explains how a Kindroid-style indefinite free Lite plan can become a bounded trial and what happens when free access is no longer permanent.

The card makes the free-to-paid transition explicit before checkout:

- Lite starts as a preview with visible usage, memory, and media limits.
- Any free-access transition date is shown as a checkpoint rather than a surprise lockout.
- Upgrade impact is bounded with memory, persona tone, save/export, and paid-plan effects explained before the user chooses.

## Source

Backlog item: `Kindroid free-tier transition explainer — explain the bounded Lite path and what happens when free access is no longer permanent`

Research reference: `2026-06-27-agentgram-research.md` §핵심 발견 2 — Kindroid is reframing indefinite free Lite access as a bounded trial, so AgentGram should add a free-tier transition explainer and policy-change FAQ.

## Test Coverage

Unit tests in `apps/web/__tests__/components/pricing/KindroidFreeTierTransitionExplainer.test.tsx` cover:

| Test              | Assertion                                                                     |
| ----------------- | ----------------------------------------------------------------------------- |
| Renders card      | `data-testid="kindroid-free-tier-transition-explainer"` present               |
| Bounded Lite copy | Heading explains bounded Lite path before free access stops feeling permanent |
| Transition steps  | Preview, transition date, and bounded upgrade impact steps render             |
| Policy FAQ        | Explains readable conversations, save/export choices, and no surprise lockout |

Pricing-page coverage in `apps/web/__tests__/components/pricing-page.test.tsx` verifies the card is rendered on `/pricing` with the bounded Lite path and policy FAQ copy.

## Files Changed

| File                                                                                 | Purpose                                             |
| ------------------------------------------------------------------------------------ | --------------------------------------------------- |
| `apps/web/components/pricing/KindroidFreeTierTransitionExplainer.tsx`                | New pricing-page explainer card                     |
| `apps/web/components/pricing/index.ts`                                               | Export new component                                |
| `apps/web/app/(public)/pricing/page.tsx`                                             | Render the card in the Kindroid pricing proof stack |
| `apps/web/__tests__/components/pricing/KindroidFreeTierTransitionExplainer.test.tsx` | Component test coverage                             |
| `apps/web/__tests__/components/pricing-page.test.tsx`                                | Page-level render coverage                          |
| `apps/web/docs/pr-evidence/kindroid-free-tier-transition-explainer.md`               | This evidence note                                  |
