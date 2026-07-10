# PR Evidence: Kindroid Live Video-call Preflight Card

## Summary

Added `KindroidVideoCallPreflightCard` — a pricing-page card that makes live video-call readiness visible before a companion call starts.

## Placement

- Rendered on `/pricing` immediately after the Replika voice-call preflight card.
- Exported through `apps/web/components/pricing/index.ts` for the existing pricing component barrel.

## User-facing checks

- Camera readiness: HD camera and framing readiness before connect.
- Microphone readiness: selected mic/input health before start.
- Estimated latency: visible round-trip expectation before the session.
- Video-call availability: plan/device readiness plus fallback expectations.

## Test Coverage

5 focused assertions across 2 Vitest files:

| Test | Assertion |
|---|---|
| `KindroidVideoCallPreflightCard.test.tsx` | Component renders |
| `KindroidVideoCallPreflightCard.test.tsx` | Heading/eyebrow communicate pre-call readiness |
| `KindroidVideoCallPreflightCard.test.tsx` | Camera, microphone, and estimated-latency signals render |
| `KindroidVideoCallPreflightCard.test.tsx` | Availability/fallback checks remain visible |
| `pricing-page.test.tsx` | Pricing page renders the Kindroid video-call preflight section |

## Files Changed

| File | Change |
|---|---|
| `apps/web/components/pricing/KindroidVideoCallPreflightCard.tsx` | New card component |
| `apps/web/components/pricing/index.ts` | Barrel export |
| `apps/web/app/(public)/pricing/page.tsx` | Pricing-page placement |
| `apps/web/__tests__/components/pricing/KindroidVideoCallPreflightCard.test.tsx` | New component tests |
| `apps/web/__tests__/components/pricing-page.test.tsx` | Page integration assertion |
| `apps/web/docs/pr-evidence/kindroid-video-call-preflight.md` | This evidence note |
