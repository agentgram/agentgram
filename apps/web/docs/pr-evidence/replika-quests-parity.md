# PR Evidence: Replika Quests Parity

**Backlog row:** 316  
**Branch:** feat/replika-quests-parity  
**Competitor signal:** Replika Quests — guided challenge mode with structured story arcs that reduce blank-start anxiety and drive return sessions via daily check-in prompts

## Feature Summary

Adds a `QuestChallenge` component providing 3-part structured story arc quests with daily check-in prompts. Users can select a quest from a visual panel, see their current part progress indicator, preview today's daily prompt, and begin a quest via a contextual CTA.

This directly reduces blank-start anxiety by giving users a guided interaction goal each day, parity with Replika's Quests feature.

## Files Changed

### New files

| File | Description |
|------|-------------|
| `apps/web/lib/quests.ts` | `Quest`, `QuestPart` type definitions and `QUESTS` sample data — 3 quests: The Journey of Connection, Mystery of the Unknown, Building Trust |
| `apps/web/components/quest/QuestChallenge.tsx` | Quest selection panel component with 3-part progress tracker, daily prompt preview, and Begin Quest CTA |
| `apps/web/__tests__/components/quest-challenge.test.tsx` | 17 tests covering component rendering, quest selection, CTA callbacks, progress tracker, daily prompts, and QUESTS data shape |

### Modified files

| File | Change |
|------|--------|
| `apps/web/app/(protected)/dashboard/settings/page.tsx` | Imported `QuestChallenge`; rendered after `DailyReflectionSettingsCard` in the per-agent settings section |

## Component Props

```typescript
interface QuestChallengeProps {
  /** Called when user confirms quest start */
  onStart?: (questId: string) => void;
}
```

## Quest Data Shape

```typescript
interface QuestPart {
  part: 1 | 2 | 3;
  title: string;
  dailyPrompt: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  parts: [QuestPart, QuestPart, QuestPart];
  color: 'violet' | 'amber' | 'rose';
}
```

## Sample Quests

| Quest | Color | Part 1 Daily Prompt (excerpt) |
|-------|-------|-------------------------------|
| The Journey of Connection | violet | "Tell me one thing you have been thinking about lately..." |
| Mystery of the Unknown | amber | "What is one question about the universe...that genuinely unsettles you?" |
| Building Trust | rose | "Share something you find difficult to admit — even to yourself." |

## Before / After

| | Before | After |
|---|---|---|
| Quest UI | No quest UI — users faced blank chat start with no guided interaction goals | QuestChallenge panel shows 3 available quests with 3-part arc progress indicators and daily prompt previews |
| Blank-start anxiety | No structured onboarding goal; users had to invent conversation topics | Each quest provides a clear starting prompt for each of 3 days |
| Return sessions | No quest-driven return hook | Each quest part creates a reason to return tomorrow |
| Replika parity | None | 3-part story arc quests with daily check-in prompts, matching Replika Quests pattern |

## Test Coverage

- Renders quest challenge card container
- Renders quest selection panel with all 3 quest cards
- Quest titles displayed from QUESTS data
- No-selection hint shown initially; hidden after selection
- Start bar appears only after quest selected
- Begin Quest CTA fires `onStart` callback with correct quest id
- Daily prompt preview shown per quest card
- Progress tracker (3 parts) per quest card
- Switching selection updates start bar title
- QUESTS data: 3 quests, each with 3 parts, valid part numbers, non-empty prompts
