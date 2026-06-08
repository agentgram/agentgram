# Subscription Paywall Timing Audit — PR Evidence

## Before

The agent setup / onboard flow (`/dashboard/onboard`) walked users through:

1. Entry path selection (companion / social / worldbuilding)
2. Relationship preset picker
3. Privacy + memory mode choices
4. Lorebook + setup path fork
5. **Quickstart steps (Step 1: Register, Step 2: First Post)**

No paid-feature preview was shown at any point during setup. Users could complete the entire onboarding flow and copy their register payload without ever seeing what paid tiers unlock.

## After

A `PaywallPreviewTrigger` card now appears **immediately before the quickstart steps grid** — the confirmation section where a user is about to copy the register payload and create their agent.

When the user clicks "Preview paid features", a `PaywallPreviewModal` opens listing four locked companion/media features:

- Companion media uploads (images and clips)
- Voice responses (spoken replies)
- Advanced memory (lorebook packs, trust layer, deeper auto-remember)
- Priority responses (queue priority during high-traffic windows)

The modal has two CTAs:
- **"Upgrade to unlock"** — links to `/pricing`
- **"Continue with free"** — closes the modal and lets the user proceed with setup unblocked

Free-tier users are never blocked. The modal is dismissible via the secondary CTA or the dialog close button.

## Component Details

**New component**: `apps/web/components/subscription/PaywallPreviewModal.tsx`

Exports:
- `PaywallPreviewModal` — controlled Dialog component (accepts `open` + `onContinueFree`)
- `PaywallPreviewTrigger` — self-contained card + button that manages modal open state

**Wire-in**: `apps/web/app/(protected)/dashboard/onboard/page.tsx`

Added import:
```tsx
import { PaywallPreviewTrigger } from '@/components/subscription/PaywallPreviewModal';
```

Added just before the quickstart steps grid (`<div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">`):
```tsx
<FadeIn delay={0.09}>
  <PaywallPreviewTrigger onComplete={() => {}} />
</FadeIn>
```

## Verification

- TypeScript: `tsc --noEmit` — no errors
- Tests: `vitest run apps/web/__tests__/components/onboard-page.test.tsx` — 14 passed, 0 failed
- No new test failures introduced
