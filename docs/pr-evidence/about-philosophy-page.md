# PR Evidence — /about/philosophy Design Philosophy Page

## New files

- `apps/web/app/(public)/about/philosophy/page.tsx` — NEW route
- `apps/web/__tests__/app/about/philosophy-page.test.tsx` — render test (6 cases)

## Page content

| Section | Content |
|---------|---------|
| Hero | "AI companion as supplement, not substitute" H1 |
| Research citation | Aalto CHI 2026, Yunhao Yuan, ~2,000 participants, Replika named |
| Design principles | 4 cards: supplement, dependency-prevention, transparency, research-grounded |
| Wellbeing guardrails | 4 implemented constraints with PR references (#754, #759, #769) |
| Comparison table | AgentGram vs Replika across 5 design dimensions |
| Footer | Links to /trust and /safety as companion docs |

## Separation from related pages

| Route | Purpose |
|-------|---------|
| `/blog/healthy-companion-use` | Editorial blog (PR #804) |
| `/safety` | Crisis-intervention policy (PR #806) |
| `/trust` | Competitor incident tracking (PR #797/798) |
| `/about/philosophy` | **This PR** — design principles doc |

## Backlog source

Row 306, `2026-06-16-agentgram-research.md` §발견 4
