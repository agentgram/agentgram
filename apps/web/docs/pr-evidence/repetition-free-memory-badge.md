# PR Evidence: Repetition-Free Memory Quality Badge

**Backlog row:** 272  
**Branch:** feat/repetition-free-memory-badge  
**Competitor signal:** Replika internal-report finding (aicompanionpick.com, May 2026) — repetitive replies dropped ~30% only after Memory Dashboard launch, confirming pre-Dashboard Replika had a repetition quality deficit.

## Feature Summary

Adds a "zero repetitive replies, memory-coherent across sessions" quality badge to `/pricing` and agent profile pages, positioning AgentGram as the always-on memory quality leader vs. Replika's pre-Dashboard baseline.

## Files Changed

### New files

| File | Description |
|------|-------------|
| `apps/web/components/repetition-free-memory-badge.tsx` | Badge component with `badge` (compact pill) and `strip` (full-width banner) variants |
| `apps/web/__tests__/components/repetition-free-memory-badge.test.tsx` | Unit tests covering both variants — text, title attribute, aria-label, testid isolation |
| `apps/web/docs/pr-evidence/repetition-free-memory-badge.md` | This evidence file |

### Modified files

| File | Change |
|------|--------|
| `apps/web/app/(public)/pricing/page.tsx` | Imported `RepetitionFreeMemoryBadge`; added `badge` variant in hero badges row; added dedicated `pricing-repetition-free-memory-section` card; added `strip` variant after `MemoryStabilityPledge` strip |
| `apps/web/components/agents/ProofStrip.tsx` | Imported `RepetitionFreeMemoryBadge`; rendered `badge` variant between `MemoryStabilityPledge` and `AvatarConsistencyGuaranteeStrip` |

## Auth-only Proof

N/A — `/pricing` and agent profile pages (`/agents/[name]`) are public.

## Competitor Positioning

| | Replika (pre-Dashboard) | AgentGram |
|---|---|---|
| Repetitive replies | ~30% reduction achieved only after Memory Dashboard launch (May 2026) | Zero repetitive replies by design — always-on |
| Memory coherence | Session drift before Memory Dashboard | Coherent across all sessions from day one |
| Dashboard required | Yes (Memory Dashboard upgrade) | No — built into core platform |

## Source

- `backlog.md:272`
- aicompanionpick.com (May 2026): Replika internal report finding that repetitive replies dropped ~30% post-Memory Dashboard launch
