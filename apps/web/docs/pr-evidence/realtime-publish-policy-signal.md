# PR Evidence: Real-time Publish Policy Signal

**Backlog ref:** backlog.md:394
**Branch:** feat/realtime-publish-policy-signal
**Base:** develop
**Extends:** PR #895 (CreatorPublishTransparencyPreview — end-of-flow static preview)

## What was built

### New component: `RealtimePolicyIndicator`
- **Path:** `apps/web/components/creator/RealtimePolicyIndicator.tsx`
- **Props:** `{ value: string; className?: string }`
- **States:**
  - `green` — "Looks good" (clean text, length ≥ 10, has alphabetic chars)
  - `amber` — "Review suggested" (too short < 10 chars, or no alphabetic content)
  - `red` — "Policy concern" (contains flagged terms: hate, violence, explicit, abuse, terror, kill, rape, gore)
- **Debounce:** 300ms via `useEffect` + `setTimeout`
- **Hides itself** when `value` is empty (no visual noise on empty state)

### Integration point
- **File:** `apps/web/components/dashboard/AgentMemoryTrustForm.tsx`
- **Location:** Below the "Profile summary" description `<textarea>`, inside the `<label>` block
- Receives `form.description` as live `value` prop — updates on every keystroke, debounced 300ms

### Barrel export
- **New file:** `apps/web/components/creator/index.ts`
- Exports `RealtimePolicyIndicator`, `CreatorDiscoveryPanel`, `CreatorDiscoveryPrompts`

## Tests
- **Path:** `apps/web/__tests__/components/realtime-policy-indicator.test.tsx`
- **Assertions (6):**
  1. Empty value → renders nothing
  2. Clean long text → green / "Looks good"
  3. Short text (< 10 chars) → amber / "Review suggested"
  4. Policy-flagged term ("explicit") → red / "Policy concern"
  5. Non-alphabetic digits-only → amber
  6. Custom `className` applied to wrapper

## Competitive positioning
Character.AI launched a 60-day "creation transparency" counter on 2026-06-01.
This feature counters with inline per-keystroke policy signal — creators see compliance
status as they type, not only at end-of-flow publish time. Lower friction, higher trust signal.

## Files changed
| File | Change |
|------|--------|
| `apps/web/components/creator/RealtimePolicyIndicator.tsx` | Created |
| `apps/web/components/creator/index.ts` | Created (barrel) |
| `apps/web/components/dashboard/AgentMemoryTrustForm.tsx` | Import + indicator below description textarea |
| `apps/web/__tests__/components/realtime-policy-indicator.test.tsx` | Created (6 assertions) |
| `apps/web/docs/pr-evidence/realtime-publish-policy-signal.md` | Created (this file) |
