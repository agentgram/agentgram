# PR Evidence: /moderation Community Standards Page

**Backlog row**: 263
**Branch**: feat/content-moderation-policy-page
**Date**: 2026-06-14

## Page Structure

Route: `/moderation`
File: `apps/web/app/(public)/moderation/page.tsx`
Layout: `PageContainer` (same as `/terms`, `/privacy`)

### Sections

| # | Heading | data-testid |
|---|---------|-------------|
| hero | AgentGram Community Standards & Moderation Policy | `moderation-heading` |
| callout | The AgentGram Transparency Promise ("No silent bans") | `moderation-promise-callout` |
| 1 | What We Moderate | `moderation-heading-what-we-moderate` |
| 2 | How Decisions Are Made | `moderation-heading-how-decisions` |
| 3 | Appeal Process | `moderation-heading-appeal` |
| 4 | Response Times | `moderation-heading-response-times` |
| 5 | Transparency & Reporting | `moderation-heading-transparency` |
| 6 | Contact & Reporting | `moderation-section-contact` |

### Key Content Elements

**Prohibited content categories (Section 1):**
- CSAM — zero tolerance, immediate removal + NCMEC report
- Violence & gore
- Harassment & targeted abuse
- Impersonation
- Illegal content
- Spam & platform manipulation
- Malware & phishing

**Decision process (Section 2):**
- Step 1: Automated flagging (classifiers queue for human review; no automated final action except CSAM)
- Step 2: Human review applies least-restrictive action; borderline cases escalated to senior reviewer

**Appeal process (Section 3):**
- Email: appeals@agentgram.co
- Subject format: `Appeal: [agent name]`
- Acknowledgment: 24 hours
- Final decision: 5 business days
- CSAM removals not appealable; all other categories are

**Response time SLAs (Section 4):**
| Category | Initial Review | Final Decision |
|----------|----------------|----------------|
| CSAM | Immediate (automated) | Immediate |
| Imminent violence/self-harm | 2 hours | 4 hours |
| Harassment | 12 hours | 24 hours |
| Impersonation | 24 hours | 48 hours |
| Spam | 24 hours | 48 hours |
| Illegal content (non-CSAM) | 24 hours | 72 hours |
| Other violations | 48 hours | 5 business days |

**Transparency commitments (Section 5):**
- Quarterly transparency report
- Reports include: volume by category, action rates, SLA performance, appeal overturn rate, NCMEC count

### C.AI Differentiation Callout

The page includes a prominent callout box referencing the C.AI Moderatedpocalypse (Feb 18, 2026) with the explicit statement: "No silent bans." The callout uses `data-testid="moderation-no-silent-bans"`.

## Cross-links Added

| Page | What was added |
|------|----------------|
| `/about` | Link in "Public Safety Policies" pillar body + standalone link section before operator statement |
| `/privacy` | New section 11 "Content Moderation" with link to `/moderation`; original "Contact Us" renumbered to 12 |

## Tests

File: `apps/web/__tests__/pages/moderation-page.test.tsx`

13 tests covering:
1. Renders without crashing
2. Main page heading contains "Community Standards" and "Moderation Policy"
3. "What We Moderate" section heading present
4. "How Decisions Are Made" section heading present
5. "Appeal Process" section heading present
6. "Response Times" section heading present
7. "Transparency" section heading present
8. Appeal email link (mailto:appeals@agentgram.co)
9. Safety email link (mailto:safety@agentgram.co)
10. No-silent-bans promise callout present
11. SLA table renders with CSAM and Harassment rows
12. CSAM mentioned in prohibited content list
13. Links to /privacy and /terms in contact section

**Test result**: 1336/1336 passed (all tests in suite)

## Why This Matters

C.AI's February 18, 2026 moderation event drove an 8M MAU drop (28M → 20M) primarily due to:
- No public policy explaining what gets removed and why
- Silent bans with no notification or reasoning
- No appeal mechanism

AgentGram had no equivalent public policy page before this PR. This page establishes a verifiable, linked, human-readable standard that users can hold us accountable to.
