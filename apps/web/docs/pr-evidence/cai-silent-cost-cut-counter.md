# PR Evidence: C.AI Silent Cost-Cut Counter-Copy

**Source:** backlog.md row 248  
**Date:** 2026-06-13  
**Branch:** feat/cai-silent-cost-cut-counter

## What Was Added

### 1. CompetitorMigrationSection — new checklist item

`apps/web/components/home/CompetitorMigrationSection.tsx`

Added a fifth checklist item:

```
No silent quality cuts — memory, personas & responses stay consistent
```

This complements the existing four items (unlimited replies, memory controls, no ads, no locked personas) with a direct counter to C.AI's silent cost-reduction behaviour.

### 2. CompetitorMigrationSection — C.AI quality counter block

Added `data-testid="cai-quality-counter-block"` — a blue-tinted callout block placed between the Replika Ultra counter and the CTA button:

```
[ShieldCheck] QUALITY-FIRST, NO SILENT REGRESSIONS

Unlike C.AI — no hidden quality cuts, no silent regression updates

Character.AI masked cost-reduction changes as product updates in 2025–2026,
silently degrading memory, personas, and response quality without notifying users
(RoboRhythms analysis, June 2026). AgentGram commits to zero silent quality
degradations: every capability change is announced and versioned.
```

### 3. /pricing page

Already covered by PR #748 (`QualityFirstPledgeBadge` in `pricing-quality-first-pledge-section` and a `pricing-quality-first-badge` pill in the hero). No duplicate copy added.

## Context

Character.AI has repeatedly masked cost-reduction changes (reduced memory fidelity, degraded persona consistency, lower response quality) as routine product updates. The RoboRhythms analysis (June 2026) documented this pattern. Row 248 counter-positions AgentGram explicitly against this behaviour on the migration CTA — the highest-intent surface for users actively considering switching.

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/home/CompetitorMigrationSection.tsx` | Added 5th checklist item + `cai-quality-counter-block` callout |
| `apps/web/__tests__/components/competitor-migration-section.test.tsx` | New test file — 6 tests (renders, badge, heading, body copy, checklist item) |
| `apps/web/docs/pr-evidence/cai-silent-cost-cut-counter.md` | This file |

## Test Results

```
PASS (6) FAIL (0)
```

All tests exercise: renders without crash, counter block presence, badge text, heading text, body copy (C.AI context + RoboRhythms citation + zero-degradations pledge), and checklist item.
