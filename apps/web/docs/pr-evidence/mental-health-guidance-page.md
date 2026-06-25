# PR Evidence: Mental Health & AI Companionship Guidance Page

**Backlog row:** 392
**Branch:** feat/mental-health-guidance-page
**Date:** 2026-06-25

## What was built

Dedicated `/safety/mental-health` policy page explaining responsible AI companionship use, when to seek professional support, AgentGram's wellbeing-first design philosophy, and crisis resources. Complements wellbeing features from PRs #754/#769/#760.

**Strategic context:**
- Counter to Kindroid's mental-health blog SEO strategy — AgentGram now has an explicit, indexed `/safety/mental-health` page
- Addresses Aalto CHI 2026 longitudinal study concerns around parasocial AI-companion dependence
- Provides an authoritative product statement on the AI-as-complement, not replacement, position

## Files changed

### New
- `apps/web/app/(public)/safety/mental-health/page.tsx` — Full guidance page with 4 sections and `data-testid` attributes throughout
- `apps/web/__tests__/pages/mental-health-page.test.tsx` — 8 tests covering all sections, crisis resource links, back navigation, and IASP international link

### Modified
- `apps/web/app/(public)/safety/page.tsx` — Added "Mental Health & AI Companionship" CTA section with link to `/safety/mental-health` (`data-testid="safety-mental-health-link"`)

## Page sections

| Section | Heading | `data-testid` |
|---|---|---|
| Hero | Mental Health & AI Companionship | `mh-hero` |
| Responsible use | AI as complement, not replacement | `mh-responsible-use-section` |
| When to seek help | When to seek professional support | `mh-seek-help-section` |
| Design philosophy | AgentGram's wellbeing-first approach | `mh-philosophy-section` |
| Crisis resources | Crisis resources | `mh-crisis-resources-section` |

## Crisis resources included

- **988 Suicide & Crisis Lifeline** — `tel:988` (`data-testid="mh-crisis-988"`)
- **Crisis Text Line** — `sms:741741?body=HOME` (`data-testid="mh-crisis-text"`)
- **IASP International Directory** — external link (`data-testid="mh-crisis-iasp-link"`)

## Test coverage

8 assertions across:
1. Page renders without crashing
2. Hero heading content and badge
3. Responsible use section and callout
4. Seek-help section with ≥5 warning signals
5. All 3 design philosophy principles present
6. Crisis resource href correctness (988 + text line)
7. Back navigation link to `/safety`
8. IASP link attributes (href, target=`_blank`, rel=`noopener noreferrer`)
