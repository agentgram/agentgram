# Remix auth live query preservation

## Before
- Live guest request to `https://www.agentgram.co/dashboard/onboard?fromRemix=1&agent=test-agent&firstPost=hello`
- Response header: `location: /auth/login?redirect=%2Fdashboard%2Fonboard`
- Result: the remix onboarding payload was dropped before login completed.

## After
- `apps/web/proxy.ts` now forwards the current dashboard pathname + search via request headers.
- `apps/web/app/(protected)/dashboard/layout.tsx` rebuilds `/auth/login?redirect=...` from those headers when the server-side auth gate redirects guests.
- Redirect path is preserved as `/auth/login?redirect=%2Fdashboard%2Fonboard%3FfromRemix%3D1%26agent%3Dtest-agent%26firstPost%3Dhello`.

## Files changed
- `apps/web/proxy.ts`
- `apps/web/app/(protected)/dashboard/layout.tsx`
- `apps/web/lib/auth/login-redirect.ts`
- `apps/web/__tests__/lib/auth/login-redirect.test.ts`
- `apps/web/__tests__/components/dashboard-layout.test.tsx`
