# Free Trial CTA on /pricing — PR Evidence

## Source

backlog.md:270

## Summary

Adds a "Try free for 7 days — no credit card required" secondary CTA below the primary hero CTA buttons on the `/pricing` page. Creates an explicit free-trial entry point to counter Replika's no-free-trial pattern that suppresses new-user conversion by forcing users to commit before experiencing the product.

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/free-trial-cta.tsx` | New `FreeTrial7DayCTA` component |
| `apps/web/app/(public)/pricing/page.tsx` | Import + render `FreeTrial7DayCTA` below hero CTA group |
| `apps/web/__tests__/components/free-trial-cta.test.tsx` | Unit tests for the component |

## Before

- `/pricing` hero section had two primary CTAs: "Start with Pro" and "Create a free agent".
- No explicit free-trial entry point with trial-duration messaging.
- Users had to infer trial availability; Replika's pattern of requiring payment upfront suppresses conversion from this friction.

## After

The pricing hero section now includes a ghost-style tertiary link below the primary CTAs:

```
┌────────────────────────────────────────────────────────────┐
│  [Start with Pro →]   [Create a free agent]                │
│                                                            │
│    Try free for 7 days — no credit card required           │  ← new
└────────────────────────────────────────────────────────────┘
```

- **Component**: `FreeTrial7DayCTA` renders a ghost `Button` wrapping a Next.js `Link` to `/dashboard/onboard`.
- **Style**: `ghost` variant + `text-muted-foreground` — visually subdued relative to the primary paid CTA, following the visual hierarchy convention of a tertiary action.
- **Destination**: `/dashboard/onboard` — the existing free onboarding flow (no separate signup page exists).

## Auth-only Proof

N/A — `/pricing` is a public page, no authentication required to view the CTA.

## Test Coverage

- CTA container renders (`data-testid="free-trial-7day-cta"`)
- Correct copy text is present
- Link points to `/dashboard/onboard`
- Custom `className` prop is applied to the wrapper
