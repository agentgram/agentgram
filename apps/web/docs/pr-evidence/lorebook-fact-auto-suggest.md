# PR Evidence: Lorebook Fact Auto-Suggest

**Source:** backlog.md:346
**Auth-only proof:** N/A — rendered inside authenticated chat routes (existing auth gate)

## Before

After 5+ conversation exchanges, no mechanism surfaced potential lorebook facts
to the user. Facts mentioned in conversation (character names, place names, quoted
phrases) were silently lost unless the user navigated to the lorebook manually.

## After

A dismissible "Save this detail?" chip appears above the composer after 5+ conversation
exchanges. The chip surfaces the most compact extracted fact candidate. One tap saves it
to the lorebook; a second tap dismisses until the next milestone (10, 15, …).

## Component API

### `LorebookFactAutoSuggest`

```tsx
import { LorebookFactAutoSuggest } from '@/components/lorebook/LorebookFactAutoSuggest';

<LorebookFactAutoSuggest
  messageCount={number}          // renders nothing when < 5
  suggestedFact={string | null}  // renders nothing when null
  onSave={() => void}            // called on ✓ tap
  onDismiss={() => void}         // called on × tap
/>
```

**Props**

| Prop | Type | Description |
|------|------|-------------|
| `messageCount` | `number` | Number of exchanges; chip only shown when ≥ 5 |
| `suggestedFact` | `string \| null` | Fact text to suggest; null suppresses the chip |
| `onSave` | `() => void` | Save tap handler |
| `onDismiss` | `() => void` | Dismiss tap handler |

### `extractLorebookCandidates`

```ts
import { extractLorebookCandidates } from '@/lib/lorebook-utils';

const candidates = extractLorebookCandidates(messages);
// → string[] sorted shortest-first
```

**Heuristics (applied to `user` role messages only):**

1. Double/single-quoted phrases (`"Elara the Bold"`, `'The Frozen North'`)
2. "my/her/his/their name is X" pattern → captures `X`
3. Mid-sentence capitalised words filtered against a common-words exclusion list

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/lorebook/LorebookFactAutoSuggest.tsx` | New — dismissible chip component |
| `apps/web/lib/lorebook-utils.ts` | New — `extractLorebookCandidates()` utility |
| `apps/web/components/agents/ProfileContent.tsx` | Wired `LorebookFactAutoSuggest` above composer section |
| `apps/web/__tests__/components/lorebook/LorebookFactAutoSuggest.test.tsx` | New — 17 test assertions |
| `apps/web/__tests__/lib/lorebook-utils.test.ts` | New — 11 test assertions |

## Test Results

```
LorebookFactAutoSuggest.test.tsx  PASS (17) FAIL (0)
lorebook-utils.test.ts            PASS (11) FAIL (0)
```

### LorebookFactAutoSuggest test coverage

**Visibility (6 tests)**
1. Renders when `messageCount >= 5` and `suggestedFact` provided
2. Does not render when `messageCount < 5`
3. Does not render when `messageCount` is 0
4. Does not render when `suggestedFact` is null
5. Renders when `messageCount` is exactly 5
6. Renders when `messageCount` is well above 5

**Content (4 tests)**
7. Shows "Save this detail?" prompt text
8. Displays the suggested fact excerpt
9. Truncates long fact text with ellipsis
10. Does not truncate short facts

**Interactions (4 tests)**
11. Calls `onSave` on save button click
12. Calls `onDismiss` on dismiss button click
13. Does not call `onSave` when dismiss clicked
14. Does not call `onDismiss` when save clicked

**Accessibility (3 tests)**
15. Has `aria-live="polite"` region
16. Save button has accessible label including the fact text
17. Dismiss button has accessible label

### extractLorebookCandidates test coverage (11 tests)

- Extracts double-quoted phrases
- Extracts single-quoted phrases
- Ignores quoted phrases from assistant messages
- Extracts mid-sentence proper nouns
- Does not extract common English words
- Extracts "my name is" pattern
- Extracts "her name is" pattern
- Returns empty array for empty input
- Returns empty array for assistant-only messages
- Handles messages with no extractable content
- De-duplicates repeated candidates
