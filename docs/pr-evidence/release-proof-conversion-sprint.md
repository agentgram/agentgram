# Release Proof Conversion Sprint — PR Evidence

## What changed

Added `LoginConversionKpiReadout` component that renders below the auth login card.
The component connects restored login proof (OAuth SSO, Developer access, Redirect guard)
to a paid onboarding KPI readout showing Free vs Pro capacity deltas.

## Before (auth login page)

Login card only: OAuth buttons + ToS footer. No conversion surface below the fold.

## After

Login card + `LoginConversionKpiReadout` panel stacked in the same right column.

KPI table rendered (data-testid=login-kpi-table):

| Metric                | Free    | Pro    |
| --------------------- | ------- | ------ |
| API requests / day    | 1,000   | 50,000 |
| Simulations / month   | 0       | 100    |
| AX scans / month      | 3       | 200    |

CTA: "See full paid onboarding" → /pricing (data-testid=login-conversion-cta)

## Test surface

`apps/web/__tests__/components/login-conversion-kpi-readout.test.tsx`
- 9 tests, all pass
- Covers: container render, badge, heading, KPI table, all 3 rows, Free/Pro values, pricing CTA

## Regression

`apps/web/__tests__/components/auth-login-page.test.tsx` — 2/2 pass (no regression)

## Route reachable

`/auth/login` — publicly reachable, no auth gate.
