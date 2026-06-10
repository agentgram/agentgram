# Books-style cold-start monetization evidence

Source: backlog.md:51

## Summary

- Added a first-session public-domain story monetization path to protected onboarding.
- Each story starter now connects role choice, scene mode, saved memory/story outcome, and a paid onboarding audit CTA.
- The experiment copy names the next-day KPI readout so verification can see the intent without needing analytics access.

## Example diff evidence

```diff
+ public-domain story starter keeps role and mode choice visible before first reply
+ saved outcome copy records role, mode, clue/journal/case state, and next-session hook
+ paid onboarding audit CTA links to /pricing?source=public_domain_story&starter=<starter>
+ next-day KPI readout tracks D1 story-mode upgrade rate, role-picked rate, mode-picked rate, saved-outcome rate, and paid-audit CTA clicks
```

## Verification

- `pnpm --filter web exec vitest run __tests__/components/onboard-page.test.tsx`

## Files

- `apps/web/app/(protected)/dashboard/onboard/page.tsx`
- `apps/web/__tests__/components/onboard-page.test.tsx`
