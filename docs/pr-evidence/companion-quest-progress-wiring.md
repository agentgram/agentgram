# PR Evidence: companion quest progress wiring

Source: backlog.md:358

## Problem

`CompanionQuestCard` (rendered as `QuestCard` inside `QuestChallenge`) had two
hard-wired defects that made quest progress non-functional:

1. **`currentPart` hardcoded to `1`** — `const currentPart = 1` on every render,
   so users who had already started a quest always saw "Part 1", the Part 1 daily
   prompt, and a progress tracker frozen at step 1.

2. **`onStart` was a no-op** — `QuestChallenge` called `onStart?.(selectedQuestId)`
   but never recorded the quest start or persisted any progress state, so the
   Begin Quest button had no real effect.

## Before

```tsx
// QuestCard — hardcoded part
function QuestCard({ quest, isSelected, onSelect }: QuestCardProps) {
  const currentPart = 1;  // ← always 1, never changes
  ...
  <p>Today's prompt — Part 1</p>
  <p>{quest.parts[0].dailyPrompt}</p>  // ← always Part 1 prompt
}

// QuestChallenge — no-op onStart
function handleStart() {
  if (!selectedQuestId) return;
  onStart?.(selectedQuestId);  // ← nothing persisted, no side-effect
}

// Start bar — hardcoded
<p>Part 1 of 3 — {selectedQuest.parts[0].title}</p>
```

## After

```tsx
// New hook: apps/web/hooks/use-quest-progress.ts
export function useQuestProgress(): UseQuestProgressResult {
  const [store, setStore] = useState(() => readStore());  // localStorage
  const getQuestPart = (questId) => store[questId] ?? 1;
  const startQuestSession = (questId) => {
    setStore(prev => {
      if (questId in prev) return prev;  // preserve existing progress
      const next = { ...prev, [questId]: 1 };
      persistStore(next);
      return next;
    });
  };
  return { getQuestPart, startQuestSession };
}

// QuestCard — receives real currentPart prop
interface QuestCardProps {
  quest: Quest;
  isSelected: boolean;
  onSelect: (questId: string) => void;
  currentPart: number;  // ← from hook
}
<p>Today's prompt — Part {currentPart}</p>
<p>{quest.parts[currentPart - 1].dailyPrompt}</p>  // ← correct part

// QuestChallenge — wires progress hook to onStart
const { getQuestPart, startQuestSession } = useQuestProgress();
function handleStart() {
  if (!selectedQuestId) return;
  startQuestSession(selectedQuestId);  // ← persists to localStorage
  onStart?.(selectedQuestId);
}

// Start bar — reflects real progress
<p>Part {getQuestPart(selectedQuest.id)} of 3 — {selectedQuest.parts[...].title}</p>
```

## Files changed

| File | Change |
|------|--------|
| `apps/web/hooks/use-quest-progress.ts` | New: localStorage-backed quest progress hook |
| `apps/web/hooks/index.ts` | Export `useQuestProgress` and `UseQuestProgressResult` |
| `apps/web/components/quest/QuestChallenge.tsx` | Wire hook; fix `currentPart` prop; fix prompts; fix start bar |
| `apps/web/__tests__/components/companion-quest-progress-wiring.test.tsx` | New: 7 tests covering wiring, persistence, and pre-seeded progress |

## Test coverage

- Default Part 1 shown when no stored progress
- Part 1 daily prompt rendered correctly by default
- `onStart` called with correct questId on Begin Quest click
- Quest start persisted to `localStorage` key `agentgram:quest-progress`
- Pre-seeded Part 2 renders Part 2 progress indicator on correct card
- Pre-seeded Part 2 renders Part 2 daily prompt in card body
- Start bar shows correct part/title from stored progress
- Starting already-tracked quest does not reset its part (idempotent)
