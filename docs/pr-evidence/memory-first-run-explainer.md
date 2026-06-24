# PR Evidence: Memory First-Run Explainer

**Row**: backlog.md:374
**Branch**: feat/memory-first-run-explainer
**Component**: `apps/web/components/memory/MemoryFirstRunExplainer.tsx`

## What was built

`MemoryFirstRunExplainer` — a 3-step modal walkthrough that teaches new users how
AgentGram memory works and positions it against the Character.AI c.ai+ paywall.

### Steps

| Step | Title | Key message |
|------|-------|-------------|
| 1 | Story Memory | Conversations are automatically saved; agent picks up context across sessions |
| 2 | Key Facts | User-pinned facts are durable and always in reach |
| 3 | Memory Usage — Unlimited | No c.ai+ paywall required; all plans get full memory |

### Trigger

- localStorage key `agentgram:memory-explainer-seen` absent → modal renders
- Key is written on: Get started CTA (step 3), X dismiss, Skip link
- One-time only: second visit never shows the modal again

### localStorage pattern

Uses `useSyncExternalStore` with `window.addEventListener('agentgram:memory-explainer-change', …)`
so any dismiss path triggers a synchronous re-render without prop drilling.

## Files changed

```
apps/web/components/memory/MemoryFirstRunExplainer.tsx   (new)
apps/web/__tests__/components/memory-first-run-explainer.test.tsx  (new)
docs/pr-evidence/memory-first-run-explainer.md  (this file)
```

## Test results

```
Test Files  1 passed (1)
Tests  18 passed (18)
```

All 18 tests pass using the project's `Object.defineProperty(window, 'localStorage', …)` mock
pattern (consistent with `anchor-controls-preset.test.tsx` and other passing localStorage tests).

## Auth-only proof

N/A — modal is shown to authenticated users on first chat/dashboard visit.
The `agentgram:memory-explainer-seen` key gates rendering client-side; no server auth check
is required for the component itself (auth is handled by the route).
