# PR Evidence: Platform Trust Scorecard Block

## Before
/about page had no competitive trust comparison section.

## After
- `TrustScorecardBlock` component added at end of /about page (before the Operator Statement)
- 3-column comparison: AgentGram vs Replika vs Character.AI
- 6 rows: GDPR Compliance, No Data-Driven Ads, Moderation Safety, Pricing Transparency, Operator Independence, API Access
- Factual footnotes referencing Replika €5M GDPR fine (Italian DPA 2023) and C.AI moderation record (2024 press reporting)
- Cell values: yes (✓ green), warn (⚠ yellow), no (✗ red)

## Test coverage
- File: `apps/web/__tests__/components/trust/TrustScorecardBlock.test.tsx`
- 11 tests: render, heading, column headers (×3), AgentGram advantage cells, 6 rows, GDPR row, API row, footnotes content, aria-labelledby
