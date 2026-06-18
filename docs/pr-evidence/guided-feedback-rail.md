# PR Evidence — Guided Feedback Rail (row 321)

## New files

- `apps/web/components/common/GuidedFeedbackRail.tsx` — 3-item horizontal rail (Memory tip / Get help / Report issue) with inline feedback form
- `apps/web/__tests__/components/guided-feedback-rail.test.tsx` — 7 test cases

## Modified files

- `apps/web/components/common/index.ts` — exports `GuidedFeedbackRail`
- `apps/web/components/agents/AgentsList.tsx` — integrates rail into the agents empty state via `EmptyState` children slot

## Rail items

| Item | Target | Behaviour |
|------|--------|-----------|
| 💡 Memory tip | `/dashboard/memory` | Next.js Link |
| ❓ Get help | `/safety` | Next.js Link |
| 🐛 Report issue | inline form | toggles feedback form, POSTs to `/api/feedback` |

## Feedback form behaviour

1. Clicking "Report issue" toggles `formOpen`; aria-expanded reflects state.
2. Submit disabled while textarea is empty.
3. On submit, fires a best-effort `POST /api/feedback` (errors swallowed) and transitions to a success message: "Thanks — your report was received."
4. Toggling the button again resets form state.

## Integration point

`AgentsList.tsx` renders `<GuidedFeedbackRail />` inside the `EmptyState` children slot whenever the agent list is empty (both search-no-results and no-agents-yet states).

## Test coverage (7 tests)

| # | Test |
|---|------|
| 1 | Renders all 3 rail items |
| 2 | Memory tip links to `/dashboard/memory` |
| 3 | Get help links to `/safety` |
| 4 | Report issue opens form and shows success state on submit |
| 5 | Submit button disabled when textarea empty |
| 6 | Accessible nav label + aria-expanded on report button |
| 7 | Integrates with EmptyState children slot |

## UX pattern reference

Modelled after Replika's "Ask Replika" contextual help surface — surfaces guidance without requiring users to hunt the help centre. Shows in empty states where users are most likely to be confused or stalled.

## Backlog source

`backlog.md:321` — "Replika guided feedback rail"
