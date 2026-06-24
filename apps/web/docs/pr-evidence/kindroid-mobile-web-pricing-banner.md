# PR Evidence: Kindroid Mobile-vs-Web Pricing Clarity Banner (Row 378)

## Problem

Kindroid's June 2, 2026 mobile pricing change confused users about web vs app-store pricing. App stores (iOS App Store, Google Play) charge developers a 15–30% commission on in-app purchases, which is typically passed on to subscribers as a price markup. Users who subscribe via the app store pay more for the same tier than users who subscribe on the web — but without explicit messaging this is invisible.

**Before:** No messaging on /pricing about the web vs app-store price difference. Users could navigate to app-store subscriptions and pay a premium without understanding there was a cheaper web alternative.

## After

A sticky `MobileWebPricingBanner` appears at the top of /pricing. It:
- Explains that subscribing on web avoids app-store markup
- Shows the web price ($9/mo Starter) alongside a callout that iOS/Android can be up to 30% more
- Counter-positions explicitly against Kindroid: "Unlike Kindroid, our web price is always our best price"
- Includes a "Subscribe on web" CTA linking to `/pricing#plans`
- Is dismissable; dismissed state persists in `localStorage` under key `mobile-web-pricing-banner-dismissed`

## Component API

```tsx
import { MobileWebPricingBanner } from '@/components/pricing';

// No props required — fully self-contained
<MobileWebPricingBanner />
```

### data-testid attributes

| testid | Description |
|---|---|
| `mobile-web-pricing-banner` | Root wrapper element |
| `mobile-web-pricing-headline` | "Subscribe on web…" headline text |
| `mobile-web-pricing-comparison` | Price comparison chip row |
| `web-price-label` | Web price chip label |
| `app-store-price-label` | App-store price chip label |
| `mobile-web-pricing-counter` | Kindroid counter-positioning copy |
| `mobile-web-pricing-cta` | "Subscribe on web" CTA button/link |
| `mobile-web-pricing-dismiss` | Dismiss (×) button |

### Dismiss behavior

- On mount: reads `localStorage.getItem('mobile-web-pricing-banner-dismissed')`; banner hidden if `'true'`
- On dismiss click: sets `localStorage.setItem('mobile-web-pricing-banner-dismissed', 'true')` and removes banner from DOM

## Placement

Added as the first child of the root `<div>` in `apps/web/app/(public)/pricing/page.tsx`, before the hero `<section>`. Sticky at `top-0 z-40` so it stays visible as users scroll.

## Auth-only Proof

N/A
