# PR evidence — remix auth redirect preserves guest onboarding intent

Source: backlog.md:76

## Before
- Guest public-profile CTA linked to `/dashboard/onboard?remix=...`
- Unauthenticated request redirected to `/auth/login?redirect=%2Fdashboard%2Fonboard`
- Result: remix agent slug, display name, description, and starter query were dropped before OAuth

## After
- Protected-route redirect now preserves the full dashboard path **and** search string
- Example redirect target: `/auth/login?redirect=%2Fdashboard%2Fonboard%3Fremix%3Dverified-builder%26displayName%3DVerified%2BBuilder%26starter%3Dgroup_chat`
- After auth callback, onboarding receives the original remix-prefill query intact

## Files changed
- `apps/web/proxy.ts`
- `apps/web/lib/auth/login-redirect.ts`
- `apps/web/__tests__/lib/auth/login-redirect.test.ts`
