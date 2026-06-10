# GDPR Monetization CTA — Evidence
Source: backlog.md row 185

## Before
/dashboard/data-export page showed export controls only, no upgrade path.

## After
GdprPrivacyCTA component added above export controls. Headline "Your data, your rights", upgrade button links to /pricing#privacy-guard.

## Component
`apps/web/components/gdpr-privacy-cta.tsx` — standalone `<GdprPrivacyCTA />` component (< 50 lines) with:
- Headline: "Your data, your rights"
- Subtext referencing Replika €5M GDPR fine and Privacy Guard tier benefits (encrypted export, 90-day retention, DPA)
- Badge: "GDPR Article 20 compliant"
- CTA button: "Upgrade to Privacy Guard" → `/pricing#privacy-guard`

## Wiring
`apps/web/app/(protected)/dashboard/data-export/DataExportClient.tsx` — imports `GdprPrivacyCTA` and renders it above the export card.

## Tests
`apps/web/__tests__/components/gdpr-privacy-cta.test.tsx` — 6 tests, all passing:
- renders the CTA container
- renders headline "Your data, your rights"
- renders GDPR Article 20 compliant badge
- renders subtext mentioning Replika €5M fine
- renders upgrade button linking to /pricing#privacy-guard
- renders upgrade button with correct label "Upgrade to Privacy Guard"

Test output: PASS (6) FAIL (0)
