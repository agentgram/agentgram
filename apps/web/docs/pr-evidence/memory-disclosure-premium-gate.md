# PR Evidence: isPremium gate in MemoryModeDisclosureCard

## Component Change Summary

**File**: `apps/web/components/memory/MemoryModeDisclosureCard.tsx`

Added `isPremium?: boolean` prop (default `false`) to `MemoryModeDisclosureCardProps`.

The CTA section at the bottom of the card is now conditionally rendered:

- **isPremium=false (default)**: Shows the existing "Unlock 이어하기+기억 제어" violet button linking to `/pricing` (`data-testid="memory-disclosure-upgrade-cta"`).
- **isPremium=true**: Hides the upgrade button entirely and renders a "Persistent Memory Active" badge (`data-testid="memory-disclosure-premium-active"`) styled with violet tones to match the premium column.

The comparison columns, features list, ultra-tier note, and optional `onContinue` button are unaffected by `isPremium`.

## Before / After

| Scenario | Before | After |
|---|---|---|
| Free user | Unlock CTA shown | Unlock CTA shown ✓ |
| Premium subscriber | Unlock CTA shown ❌ | "Persistent Memory Active" badge shown ✓ |

## Test Coverage

**File**: `apps/web/__tests__/components/memory-mode-disclosure-card.test.tsx`

6 new tests added under `describe('isPremium gate')`:

1. `hides upgrade CTA when isPremium=true` — `memory-disclosure-upgrade-cta` absent
2. `shows active badge when isPremium=true` — `memory-disclosure-premium-active` present with correct text
3. `shows upgrade CTA when isPremium=false (default)` — baseline regression
4. `does not show active badge when isPremium=false (default)` — baseline regression
5. `still renders comparison columns and features when isPremium=true` — no structural regression
6. `still renders onContinue button alongside active badge when isPremium=true` — both CTA elements coexist correctly

**Result**: 20/20 tests pass (14 existing + 6 new).
