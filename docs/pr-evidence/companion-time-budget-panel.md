# PR Evidence: Companion Time-Budget Self-Regulation Panel

Source: backlog.md row 259

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/dashboard/TimeBudgetPanel.tsx` | New component |
| `apps/web/components/dashboard/index.ts` | Export `TimeBudgetPanel` and `TimeBudgetPanelProps` |
| `apps/web/app/(protected)/dashboard/settings/page.tsx` | Import and render `<TimeBudgetPanel />` with FadeIn |
| `apps/web/__tests__/components/time-budget-panel.test.tsx` | New test file — 11 tests |
| `apps/web/__tests__/components/proactive-controls-settings.test.tsx` | Add `TimeBudgetPanel: vi.fn(() => null)` to dashboard mock |

## Component Description

`TimeBudgetPanel` is a `'use client'` React component rendered in the user settings page under a "Wellbeing" context. It provides:

- **Daily goal input** — numeric input (minutes, default 30, min 5, max 480)
- **Weekly goal input** — numeric input (hours, default 3, min 0.5, max 40, step 0.5)
- **Weekly usage trend chart** — 7-bar visual (Mon–Sun) using mock session data; bars turn amber when a day exceeds the daily goal
- **Save goals button** — persists goals to `localStorage` under key `agentgram:timeBudget`
- **Status feedback** — success/error message after save

Goals are loaded from `localStorage` on mount via `useEffect`. An `initialGoals` prop bypasses localStorage (used in tests to avoid SSR/jsdom issues).

## Motivation

CHI 2026 Aalto research shows heavy AI companion users exhibit loneliness signals. This panel is a voluntary self-regulation tool — no enforcement, just intentional goal-setting. Complements PR #760 session nudge.

## Test Coverage

File: `apps/web/__tests__/components/time-budget-panel.test.tsx`

| Test | Coverage |
|------|----------|
| renders panel container | Panel mounts |
| renders daily goal input with default | Input present, value=30 |
| renders weekly goal input with default | Input present, value=3 |
| renders save goals button | Button present |
| renders weekly trend chart | Chart section present |
| renders weekly trend summary | Summary text present |
| renders 7 trend bars (one per weekday) | Mon–Sun bars present |
| updates daily goal when user types | Controlled input works |
| updates weekly goal when user types | Controlled input works |
| save button persists goals to localStorage | localStorage.setItem called with correct values |
| shows success status message after saving | Status text updates |
| renders wellbeing badge | Badge present |

All 12 tests pass. Full suite: 139 test files / 1292 tests — all green.
