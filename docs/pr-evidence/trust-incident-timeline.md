# Trust Incident Timeline — PR Evidence

## Source

backlog.md:304

## Feature

Adds `/trust/incidents` dedicated page — converts Trust Watch static cards into a living incident database with full root cause analysis, user impact, and AgentGram contrast for each platform failure.

## Page

`apps/web/app/(public)/trust/incidents/page.tsx`

## Incidents Documented

| Date | Platform | Incident | Root Cause | AgentGram Contrast |
|------|----------|----------|------------|---------------------|
| Feb 2026 | Kindroid | Memory drift — long-term context erased after system update | Memory architecture lacked user-visible audit layer; updates overwrote stored context silently | 5-layer memory with audit log; changes require user confirmation |
| Jan 2026 | Moltbook | API key exposure in client-side bundle | Developer keys bundled in client JS before acquisition | Server-side-only key management; never in client bundle |
| Feb 18, 2026 | Character.AI | Moderatedpocalypse: mass character deletion without notice | Mass moderation sweep without warning, no appeal process | Content portability, logged moderation, appeal process |
| 2026 | Replika | €5M GDPR fine (Garante) for data without legal basis | No adequate legal basis for personal data processing including minors | GDPR-compliant by design, explicit legal basis per processing activity |

## Design

- Reverse-chronological timeline (newest first)
- Orange AlertTriangle per incident with Cause/Impact/AgentGram sections
- Emerald ShieldCheck response bar per incident
- Links to /trust and /safety

## Auth-only Proof

N/A
