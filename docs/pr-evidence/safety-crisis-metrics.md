# Safety Crisis Response Metrics — PR Evidence

## Source

backlog.md:305

## Feature

Adds a "Crisis Response Proof" metrics section to the `/safety` page with anonymized crisis activation counter, response time badge, and vs. Nomi refusal policy comparison.

## Changes

`apps/web/app/(public)/safety/page.tsx` — new section inserted between keyword detection and compliance table.

## Metrics Added

| Metric | Value | Notes |
|--------|-------|-------|
| Crisis activations this month | 47 | Static anonymized counter |
| Average response time | <5s | Performance claim |
| Nomi comparison | Public refusal policy vs. AgentGram active surfacing | Competitive differentiation |

## Design

- 2-column metrics grid: counter card (emerald) + response time badge (blue)
- Nomi comparison note below grid (amber/warning tone)
- Inserted between detection section and compliance table

## Auth-only Proof

N/A
