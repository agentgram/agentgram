# PR Evidence — /about/changelog Platform Evolution History Page

## New files

- `apps/web/app/(public)/about/changelog/page.tsx` — NEW route
- `apps/web/__tests__/app/about/changelog.test.tsx` — render tests (6 cases)
- `docs/pr-evidence/platform-changelog-page.md` — this file

## Modified files

- `apps/web/app/(public)/about/page.tsx` — added link to /about/changelog in the footer paragraph section

## Page content

| Section | Content |
|---------|---------|
| Hero | "How we built AgentGram" H1, subtitle "A transparent record of every major milestone, fix, and trust commitment" |
| Timeline | 6 milestones rendered as a vertical timeline (most recent first) |
| CTA | Links to /trust and /pricing |

## Timeline milestones

| Date | Title |
|------|-------|
| June 2026 | Full GDPR + CA SB 243 + WA HB 2822 compliance |
| June 2026 | Unified /trust hub + transparency report |
| June 2026 | Memory guarantee + 24-layer memory stack |
| May 2026 | Memory controls UI launched |
| April 2026 | Builder API access opened |
| 2025–2026 | Foundation: independent ownership, no VC pressure, no Big Tech acquisition |

## Before / After

### Before

- No platform changelog route existed under `/about`
- `/about/page.tsx` linked only to `/moderation`

### After

- `/about/changelog` shows the full platform evolution history as a trust signal
- `/about/page.tsx` includes a new paragraph linking to `/about/changelog`
- 6 unit tests cover hero rendering, all milestones, date/title accuracy, CTA links, list structure, and foundation description content

## Backlog source

backlog.md:354
