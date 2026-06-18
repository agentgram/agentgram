# PR Evidence: Story Continuity Resume Chip + Memory Mode Disclosure Card

Source: backlog.md rows 320 + 323 (strategy-meeting-2026-06-18)

## Components Created

### 1. `StoryContinuityResumeChip`
**File**: `apps/web/components/home/StoryContinuityResumeChip.tsx`

One-tap resume entry for the last narrative/Books/world story session. Shown on the home page for returning users; hidden (returns `null`) when no prior session exists.

**Props**:
- `lastSession?: LastStorySession | null` — if omitted or null, renders nothing
- `lastSession.worldName` — displayed as the story world title
- `lastSession.agentName` — displayed as the companion agent name
- `lastSession.resumeHref` — Resume CTA target
- `lastSession.chapterLabel?` — optional chapter/position label appended to agent name

**Premium CTA**: "Unlock 이어하기+기억 제어" → `/pricing`

### 2. `MemoryModeDisclosureCard`
**File**: `apps/web/components/memory/MemoryModeDisclosureCard.tsx`

Two-column disclosure card explaining the difference between free (Retrievable) and premium (Persistent) memory before the upgrade modal or settings. Includes ultra-tier gating note.

**Props**:
- `onContinue?: () => void` — if provided, shows "Continue with free memory" secondary button
- `className?: string` — forwarded to root element

**Premium CTA**: "Unlock 이어하기+기억 제어" → `/pricing`

## Integration Points

| Component | Integration |
|-----------|-------------|
| `StoryContinuityResumeChip` | `apps/web/app/(public)/page.tsx` — after `<CompanionScenarioCards />`, in a centred `max-w-xl` container with a demo session |
| `MemoryModeDisclosureCard` | `apps/web/app/(protected)/dashboard/settings/page.tsx` — rendered above `<AgentPinnedFactsCard>` for free-plan users |
| `StoryContinuityResumeChip` | Re-exported from `apps/web/components/home/index.ts` |

## Tests

- `apps/web/__tests__/components/story-continuity-resume-chip.test.tsx` — 11 tests
- `apps/web/__tests__/components/memory-mode-disclosure-card.test.tsx` — 11 tests

**All 26 tests pass. TypeScript: no errors.**

## Before / After

### StoryContinuityResumeChip (row 320 — C.AI Books parity)

**Before**: No resume entry on the home page. Returning users had to manually navigate to find their last session world.

**After**: `StoryContinuityResumeChip` renders a compact card showing the last story world, agent name, and chapter position. "Resume" CTA takes the user directly back. Hidden for new users (returns null when `lastSession` is absent).

### MemoryModeDisclosureCard (row 323 — Kindroid counter-positioning)

**Before**: No explanation of memory tiers before the upgrade flow. Users upgrading to persistent memory had no visibility into what "retrievable" vs "persistent" meant, or which features require the paid Ultra tier.

**After**: `MemoryModeDisclosureCard` shows a two-column comparison (free vs premium) with specific feature lists and an ultra-gating footnote. Shown to free-plan users above the pinned facts section in settings, and also embedded on the marketing home page for awareness. "Unlock 이어하기+기억 제어" CTA links to `/pricing`.
